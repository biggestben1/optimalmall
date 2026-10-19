<?php

namespace App\Services\Accounting;

use App\Enums\PaymentStatus;
use App\Enums\PayoutStatus;
use App\Models\AccountingPeriod;
use App\Models\Expense;
use App\Models\JournalEntry;
use App\Models\JournalLine;
use App\Models\LedgerAccount;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Reconciliation;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Wallet;
use App\Models\WalletAdjustment;
use App\Models\WalletFundingRequest;
use App\Models\WalletTransaction;
use App\Services\Vendor\AuditLogger;
use App\Services\Vendor\Earnings;
use App\Support\AccountantGate;
use App\Support\MarketplaceSettings;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class Books
{
    public const CLEARING = '1000';

    public const BANK = '1100';

    public const SUSPENSE = '1900';

    public const COMMISSION = '4000';

    public const DELIVERY = '4100';

    public const FEES = '5100';

    public const EXPENSES = '5200';

    public const ADJUSTMENTS = '5900';

    public function customerWallet(User $user): Wallet
    {
        $existing = Wallet::query()->where('user_id', $user->id)->first();

        if ($existing) {
            return $existing;
        }

        $account = LedgerAccount::query()->firstOrCreate(
            ['code' => '2000-'.$user->id],
            [
                'name' => 'Customer wallet: '.$user->name,
                'type' => 'liability',
                'owner_type' => 'user',
                'owner_id' => $user->id,
            ],
        );

        return Wallet::query()->create([
            'user_id' => $user->id,
            'ledger_account_id' => $account->id,
            'type' => 'customer',
            'status' => 'active',
        ]);
    }

    public function vendorWallet(Vendor $vendor): Wallet
    {
        $existing = Wallet::query()->where('vendor_id', $vendor->id)->first();

        if ($existing) {
            return $existing;
        }

        $account = LedgerAccount::query()->firstOrCreate(
            ['code' => '2100-'.$vendor->id],
            [
                'name' => 'Seller payable: '.$vendor->name,
                'type' => 'liability',
                'owner_type' => 'vendor',
                'owner_id' => $vendor->id,
            ],
        );

        return Wallet::query()->create([
            'vendor_id' => $vendor->id,
            'ledger_account_id' => $account->id,
            'type' => 'vendor',
            'status' => 'active',
        ]);
    }

    public function startDeposit(User $user, float $amount): Payment
    {
        if (! MarketplaceSettings::enabled('wallet_deposits_enabled')) {
            throw ValidationException::withMessages([
                'amount' => 'Wallet deposits stay off until a licensed payment provider is connected and the applicable Nigerian rules are confirmed.',
            ]);
        }

        $amount = round($amount, 2);
        $wallet = $this->customerWallet($user);
        $this->guard($wallet);
        $reference = $this->reference('WALLET');

        return DB::transaction(function () use ($wallet, $amount, $reference) {
            $payment = Payment::query()->create([
                'order_id' => null,
                'reference' => $reference,
                'method' => 'gateway',
                'amount' => $amount,
                'status' => PaymentStatus::Pending,
            ]);

            $wallet->transactions()->create([
                'reference' => $reference,
                'idempotency_key' => 'deposit-pending:'.$reference,
                'type' => 'deposit',
                'direction' => 'credit',
                'amount' => $amount,
                'status' => 'pending',
                'description' => 'Wallet funding waiting for payment confirmation',
                'payment_id' => $payment->id,
            ]);

            return $payment;
        });
    }

    public function submitFundingProof(User $user, float $amount, string $proofPath): WalletFundingRequest
    {
        $amount = round($amount, 2);
        $wallet = $this->customerWallet($user);
        $this->guard($wallet);
        $reference = $this->reference('FUND');

        return DB::transaction(function () use ($wallet, $user, $amount, $proofPath, $reference) {
            $payment = Payment::query()->create([
                'order_id' => null,
                'reference' => $reference,
                'method' => 'transfer',
                'amount' => $amount,
                'status' => PaymentStatus::Pending,
            ]);

            $wallet->transactions()->create([
                'reference' => $reference,
                'idempotency_key' => 'funding-pending:'.$reference,
                'type' => 'deposit',
                'direction' => 'credit',
                'amount' => $amount,
                'status' => 'pending',
                'description' => 'Wallet funding waiting for accountant approval',
                'payment_id' => $payment->id,
            ]);

            return WalletFundingRequest::query()->create([
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'payment_id' => $payment->id,
                'amount' => $amount,
                'proof_path' => $proofPath,
                'status' => 'pending',
            ]);
        });
    }

    public function approveFunding(WalletFundingRequest $funding, User $actor): void
    {
        DB::transaction(function () use ($funding, $actor) {
            $locked = WalletFundingRequest::query()->whereKey($funding->id)->lockForUpdate()->first();

            if ($locked === null || $locked->status !== 'pending') {
                throw ValidationException::withMessages([
                    'funding' => 'This funding request is no longer waiting.',
                ]);
            }

            $payment = Payment::query()->whereKey($locked->payment_id)->lockForUpdate()->first();
            $pending = WalletTransaction::query()
                ->where('payment_id', $payment?->id)
                ->where('status', 'pending')
                ->first();

            if ($payment === null || $pending === null) {
                throw ValidationException::withMessages([
                    'funding' => 'The payment record for this request is missing.',
                ]);
            }

            $payment->update([
                'status' => PaymentStatus::Successful,
                'paid_at' => now(),
            ]);
            $this->completeDeposit($payment->fresh(), $pending);
            $locked->update([
                'status' => 'approved',
                'reviewed_by' => $actor->id,
                'reviewed_at' => now(),
            ]);
            AuditLogger::record('wallet.funding.approved', $locked, [
                'amount' => (float) $locked->amount,
                'reference' => $payment->reference,
            ], null, $actor);
        });
    }

    public function rejectFunding(WalletFundingRequest $funding, User $actor, ?string $note = null): void
    {
        DB::transaction(function () use ($funding, $actor, $note) {
            $locked = WalletFundingRequest::query()->whereKey($funding->id)->lockForUpdate()->first();

            if ($locked === null || $locked->status !== 'pending') {
                throw ValidationException::withMessages([
                    'funding' => 'This funding request is no longer waiting.',
                ]);
            }

            Payment::query()->whereKey($locked->payment_id)->update([
                'status' => PaymentStatus::Failed,
            ]);
            WalletTransaction::query()
                ->where('payment_id', $locked->payment_id)
                ->where('status', 'pending')
                ->update(['status' => 'failed']);
            $locked->update([
                'status' => 'rejected',
                'reviewed_by' => $actor->id,
                'review_note' => $note,
                'reviewed_at' => now(),
            ]);
            AuditLogger::record('wallet.funding.rejected', $locked, [
                'amount' => (float) $locked->amount,
            ], null, $actor);
        });
    }

    public function recordVerifiedPayment(Payment $payment): void
    {
        $pending = WalletTransaction::query()
            ->where('payment_id', $payment->id)
            ->where('status', 'pending')
            ->first();

        if ($pending && $payment->order_id === null) {
            $this->completeDeposit($payment, $pending);

            return;
        }

        if ($payment->order_id && $payment->method !== 'wallet') {
            $this->recognizeSale($payment);
        }
    }

    public function payOrder(User $user, Order $order): Payment
    {
        if (! MarketplaceSettings::enabled('wallet_payments_enabled', true)) {
            throw ValidationException::withMessages([
                'order' => 'Wallet payments are turned off.',
            ]);
        }

        abort_unless($order->user_id === $user->id, 403);

        if ($order->payments()->where('status', PaymentStatus::Successful)->exists()) {
            throw ValidationException::withMessages([
                'order' => 'This order is already paid.',
            ]);
        }

        $wallet = $this->customerWallet($user);
        $amount = round((float) $order->total, 2);
        $this->guard($wallet);

        if ($wallet->balance() + 0.009 < $amount) {
            throw ValidationException::withMessages([
                'order' => 'The wallet balance does not cover this order.',
            ]);
        }

        return DB::transaction(function () use ($order, $amount, $wallet) {
            $locked = Wallet::query()->whereKey($wallet->id)->lockForUpdate()->first();

            if ($locked->balance() + 0.009 < $amount) {
                throw ValidationException::withMessages([
                    'order' => 'The wallet balance does not cover this order.',
                ]);
            }

            $payment = Payment::query()->create([
                'order_id' => $order->id,
                'reference' => $this->reference('WALLET-PAY'),
                'method' => 'wallet',
                'amount' => $amount,
                'status' => PaymentStatus::Successful,
                'paid_at' => now(),
            ]);
            $this->recognizeSale($payment);

            return $payment;
        });
    }

    public function refundToWallet(OrderReturn $return): ?JournalEntry
    {
        if (! MarketplaceSettings::enabled('wallet_refunds_to_wallet', true)) {
            return null;
        }

        $order = $return->order()->with(['items', 'user'])->first();

        if ($order?->user === null) {
            return null;
        }

        $amount = round((float) $return->refund_amount, 2);
        $wallet = $this->customerWallet($order->user);
        $subtotal = (float) $order->subtotal > 0 ? (float) $order->subtotal : (float) $order->items->sum('line_total');
        $lines = [];
        $effects = [];
        $allocated = 0.0;

        foreach ($order->items->groupBy('vendor_id') as $vendorId => $items) {
            if (! $vendorId) {
                continue;
            }

            $vendor = Vendor::query()->find($vendorId);

            if ($vendor === null) {
                continue;
            }

            $gross = (float) $items->sum('line_total');
            $share = $subtotal > 0 ? round($amount * ($gross / $subtotal), 2) : 0.0;
            $rate = (new Earnings($vendor))->rateFor($items->first());
            $commission = round($share * $rate / 100, 2);
            $vendorPart = round($share - $commission, 2);
            $vendorWallet = $this->vendorWallet($vendor);

            if ($vendorPart > 0) {
                $lines[] = ['account' => $vendorWallet->account, 'debit' => $vendorPart, 'credit' => 0];
                $effects[] = $this->effect($vendorWallet, 'debit', $vendorPart, 'refund', 'Refund '.$order->number, $order->id);
            }

            if ($commission > 0) {
                $lines[] = ['account' => $this->system(self::COMMISSION, 'Marketplace commission', 'income'), 'debit' => $commission, 'credit' => 0];
            }

            $allocated += $vendorPart + $commission;
        }

        $plug = round($amount - $allocated, 2);

        if ($plug > 0.009) {
            $lines[] = ['account' => $this->system(self::SUSPENSE, 'Unallocated receipts', 'liability'), 'debit' => $plug, 'credit' => 0];
        } elseif ($plug < -0.009) {
            $lines[] = ['account' => $this->system(self::SUSPENSE, 'Unallocated receipts', 'liability'), 'debit' => 0, 'credit' => abs($plug)];
        }

        $lines[] = ['account' => $wallet->account, 'debit' => 0, 'credit' => $amount];
        $effects[] = $this->effect($wallet, 'credit', $amount, 'refund', 'Refund for '.$order->number, $order->id);

        return $this->post('refund:'.$return->id, 'Refund '.$order->number, $lines, $effects, $return);
    }

    public function confirmPayout(Payout $payout, User $actor, string $providerReference): JournalEntry
    {
        abort_unless($payout->status === PayoutStatus::Processing, 422, 'Start the payout payment before confirming settlement.');
        abort_unless($payout->vendor && (new Earnings($payout->vendor))->canRelease($payout), 422, 'Verified earnings do not cover this payout.');

        $wallet = $this->vendorWallet($payout->vendor);
        $amount = round((float) $payout->amount, 2);

        $entry = $this->post('payout:'.$payout->id, 'Payout '.$payout->reference, [
            ['account' => $wallet->account, 'debit' => $amount, 'credit' => 0],
            ['account' => $this->system(self::BANK, 'Bank settlement', 'asset'), 'debit' => 0, 'credit' => $amount],
        ], [
            $this->effect($wallet, 'debit', $amount, 'payout', 'Payout '.$payout->reference),
        ], $payout, $actor);

        $payout->update([
            'status' => PayoutStatus::Paid,
            'paid_at' => now(),
            'confirmed_by' => $actor->id,
            'provider_reference' => $providerReference,
        ]);
        AuditLogger::record('payout.settled', $payout, [
            'amount' => $amount,
            'provider_reference' => $providerReference,
        ], $payout->vendor, $actor);

        return $entry;
    }

    public function prepareAdjustment(Wallet $wallet, string $direction, float $amount, string $reason, User $actor): WalletAdjustment
    {
        return WalletAdjustment::query()->create([
            'wallet_id' => $wallet->id,
            'direction' => $direction,
            'amount' => round($amount, 2),
            'reason' => $reason,
            'status' => 'pending',
            'prepared_by' => $actor->id,
        ]);
    }

    public function approveAdjustment(WalletAdjustment $adjustment, User $actor): JournalEntry
    {
        abort_unless($adjustment->status === 'pending', 422);
        abort_if($adjustment->prepared_by === $actor->id && ! $actor->isSuperAdmin(), 422, 'Someone else must approve this adjustment.');

        $wallet = $adjustment->wallet()->with('account')->first();
        $amount = round((float) $adjustment->amount, 2);
        $clearing = $this->system(self::ADJUSTMENTS, 'Wallet adjustments', 'expense');
        $lines = $adjustment->direction === 'credit'
            ? [
                ['account' => $clearing, 'debit' => $amount, 'credit' => 0],
                ['account' => $wallet->account, 'debit' => 0, 'credit' => $amount],
            ]
            : [
                ['account' => $wallet->account, 'debit' => $amount, 'credit' => 0],
                ['account' => $clearing, 'debit' => 0, 'credit' => $amount],
            ];

        $entry = $this->post('adjustment:'.$adjustment->id, $adjustment->reason, $lines, [
            $this->effect($wallet, $adjustment->direction, $amount, 'adjustment', $adjustment->reason),
        ], $adjustment, $actor);

        $adjustment->update([
            'status' => 'approved',
            'approved_by' => $actor->id,
            'approved_at' => now(),
            'journal_entry_id' => $entry->id,
        ]);
        AuditLogger::record('wallet.adjusted', $wallet, [
            'amount' => $amount,
            'direction' => $adjustment->direction,
        ], $wallet->vendor, $actor);

        return $entry;
    }

    public function approveExpense(Expense $expense, User $actor): JournalEntry
    {
        abort_unless($expense->status === 'submitted', 422);
        abort_if($expense->user_id === $actor->id && ! $actor->isSuperAdmin(), 422, 'Someone else must approve this expense.');

        $amount = round((float) $expense->amount, 2);
        $entry = $this->post('expense:'.$expense->id, $expense->description, [
            ['account' => $this->system(self::EXPENSES, 'Operating expenses', 'expense'), 'debit' => $amount, 'credit' => 0],
            ['account' => $this->system(self::BANK, 'Bank settlement', 'asset'), 'debit' => 0, 'credit' => $amount],
        ], [], $expense, $actor);

        $expense->update([
            'status' => 'approved',
            'approved_by' => $actor->id,
            'journal_entry_id' => $entry->id,
        ]);
        AuditLogger::record('expense.approved', $expense, ['amount' => $amount], null, $actor);

        return $entry;
    }

    public function reconcile(User $actor, string $source, string $start, string $end, float $statement, ?string $notes): Reconciliation
    {
        $expected = round((float) Payment::query()
            ->where('status', PaymentStatus::Successful)
            ->whereBetween(DB::raw('coalesce(paid_at, created_at)'), [$start.' 00:00:00', $end.' 23:59:59'])
            ->sum('amount'), 2);
        $difference = round($statement - $expected, 2);

        $row = Reconciliation::query()->create([
            'reference' => $this->reference('REC'),
            'source' => $source,
            'period_start' => $start,
            'period_end' => $end,
            'expected_amount' => $expected,
            'statement_amount' => round($statement, 2),
            'difference' => $difference,
            'status' => abs($difference) < 0.01 ? 'matched' : 'discrepancy',
            'notes' => $notes,
            'user_id' => $actor->id,
        ]);
        AuditLogger::record('reconciliation.recorded', $row, ['difference' => $difference], null, $actor);

        return $row;
    }

    public function closePeriod(User $actor, string $label, string $start, string $end, ?string $notes): AccountingPeriod
    {
        $differences = Reconciliation::query()
            ->where('status', 'discrepancy')
            ->whereDate('period_start', '>=', $start)
            ->whereDate('period_end', '<=', $end)
            ->exists();

        if ($differences && ! $actor->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'period' => 'Unresolved reconciliation differences must be cleared before this period can close.',
            ]);
        }

        $period = AccountingPeriod::query()->create([
            'label' => $label,
            'starts_on' => $start,
            'ends_on' => $end,
            'status' => 'closed',
            'has_differences' => $differences,
            'snapshot' => $this->indicators(),
            'notes' => $notes,
            'closed_by' => $actor->id,
            'closed_at' => now(),
        ]);
        AuditLogger::record('period.closed', $period, ['label' => $label, 'differences' => $differences], null, $actor);

        return $period;
    }

    /**
     * @return list<array{code: string, name: string, type: string, balance: float}>
     */
    public function trialBalance(): array
    {
        return LedgerAccount::query()->orderBy('code')->get()->map(fn (LedgerAccount $account) => [
            'code' => $account->code,
            'name' => $account->name,
            'type' => $account->type,
            'balance' => $account->balance(),
        ])->all();
    }

    /**
     * @return array<string, float|int>
     */
    public function indicators(): array
    {
        $customerLiability = round((float) Wallet::query()->where('type', 'customer')->get()->sum(fn (Wallet $wallet) => $wallet->balance()), 2);
        $vendorPayable = round((float) Wallet::query()->where('type', 'vendor')->get()->sum(fn (Wallet $wallet) => $wallet->balance()), 2);

        return [
            'payments' => round((float) Payment::query()->where('status', PaymentStatus::Successful)->sum('amount'), 2),
            'refunds' => round((float) OrderReturn::query()->where('status', 'refunded')->sum('refund_amount'), 2),
            'commission' => $this->system(self::COMMISSION, 'Marketplace commission', 'income')->balance(),
            'vendor_payables' => $vendorPayable,
            'customer_liabilities' => $customerLiability,
            'pending_payouts' => round((float) Payout::query()->whereIn('status', [PayoutStatus::Requested, PayoutStatus::Approved, PayoutStatus::Processing])->sum('amount'), 2),
            'gateway_fees' => $this->system(self::FEES, 'Payment gateway fees', 'expense')->balance(),
            'bank' => $this->system(self::BANK, 'Bank settlement', 'asset')->balance(),
            'clearing' => $this->system(self::CLEARING, 'Payment provider clearing', 'asset')->balance(),
            'unreconciled' => Reconciliation::query()->where('status', 'discrepancy')->count()
                + WalletTransaction::query()->where('status', 'pending')->count(),
        ];
    }

    public function syncMissingSales(): int
    {
        $count = 0;

        Payment::query()
            ->where('status', PaymentStatus::Successful)
            ->whereNotNull('order_id')
            ->where('method', '!=', 'wallet')
            ->orderBy('id')
            ->limit(200)
            ->get()
            ->each(function (Payment $payment) use (&$count) {
                if (JournalEntry::query()->where('idempotency_key', 'sale:'.$payment->id)->exists()) {
                    return;
                }

                $this->recognizeSale($payment);
                $count++;
            });

        return $count;
    }

    public function canApprovePayout(User $user, Payout $payout): bool
    {
        if (! AccountantGate::allows($user, 'payouts.approve')) {
            return false;
        }

        return $user->isSuperAdmin() || (float) $payout->amount + 0.009 < AccountantGate::threshold();
    }

    /**
     * @param  list<array{account: LedgerAccount, debit: float|int, credit: float|int, memo?: string}>  $lines
     * @param  list<array<string, mixed>>  $effects
     */
    public function post(string $key, string $description, array $lines, array $effects = [], ?Model $source = null, ?User $actor = null): JournalEntry
    {
        return DB::transaction(function () use ($key, $description, $lines, $effects, $source, $actor) {
            $existing = JournalEntry::query()->where('idempotency_key', $key)->lockForUpdate()->first();

            if ($existing) {
                return $existing;
            }

            $debit = 0.0;
            $credit = 0.0;

            foreach ($lines as $line) {
                $lineDebit = round((float) $line['debit'], 2);
                $lineCredit = round((float) $line['credit'], 2);
                abort_if($lineDebit < 0 || $lineCredit < 0 || ($lineDebit > 0 && $lineCredit > 0) || ($lineDebit == 0.0 && $lineCredit == 0.0), 422, 'A ledger line must contain either a debit or a credit.');
                $debit += $lineDebit;
                $credit += $lineCredit;
            }

            abort_if(abs(round($debit, 2) - round($credit, 2)) > 0.009, 422, 'This journal entry does not balance.');

            $entry = JournalEntry::query()->create([
                'reference' => $this->reference('JE'),
                'idempotency_key' => $key,
                'description' => $description,
                'posted_at' => now(),
                'user_id' => $actor?->id ?? auth()->id(),
                'source_type' => $source ? $source::class : null,
                'source_id' => $source?->getKey(),
            ]);

            foreach ($lines as $line) {
                JournalLine::query()->create([
                    'journal_entry_id' => $entry->id,
                    'ledger_account_id' => $line['account']->id,
                    'debit' => round((float) $line['debit'], 2),
                    'credit' => round((float) $line['credit'], 2),
                    'memo' => $line['memo'] ?? null,
                ]);
            }

            foreach ($effects as $effect) {
                /** @var Wallet $wallet */
                $wallet = $effect['wallet'];
                $wallet->transactions()->create([
                    'journal_entry_id' => $entry->id,
                    'reference' => $effect['reference'] ?? $entry->reference,
                    'idempotency_key' => $key.':wallet:'.$wallet->id.':'.$effect['type'],
                    'type' => $effect['type'],
                    'direction' => $effect['direction'],
                    'amount' => $effect['amount'],
                    'balance_after' => $wallet->fresh()->balance(),
                    'status' => 'posted',
                    'suspicious' => (bool) ($effect['suspicious'] ?? false),
                    'description' => $effect['description'],
                    'order_id' => $effect['order_id'] ?? null,
                    'payment_id' => $effect['payment_id'] ?? null,
                ]);
            }

            return $entry;
        });
    }

    private function completeDeposit(Payment $payment, WalletTransaction $pending): void
    {
        $wallet = $pending->wallet()->with('account')->first();
        $amount = round((float) $payment->amount, 2);
        $fee = round($amount * (float) MarketplaceSettings::get('gateway_fee_percent', 0) / 100, 2);
        $lines = [
            ['account' => $this->system(self::CLEARING, 'Payment provider clearing', 'asset'), 'debit' => round($amount - $fee, 2), 'credit' => 0],
        ];

        if ($fee > 0) {
            $lines[] = ['account' => $this->system(self::FEES, 'Payment gateway fees', 'expense'), 'debit' => $fee, 'credit' => 0];
        }

        $lines[] = ['account' => $wallet->account, 'debit' => 0, 'credit' => $amount];
        $entry = $this->post('deposit:'.$payment->id, 'Wallet deposit '.$payment->reference, $lines, [], $payment);

        if ($pending->status === 'pending') {
            $pending->update([
                'status' => 'posted',
                'journal_entry_id' => $entry->id,
                'balance_after' => $wallet->fresh()->balance(),
            ]);
        }
    }

    private function recognizeSale(Payment $payment): JournalEntry
    {
        $payment->loadMissing('order.items', 'order.user');
        $order = $payment->order;
        $amount = round((float) $payment->amount, 2);
        $fromWallet = $payment->method === 'wallet';
        $lines = [];
        $effects = [];
        $credited = 0.0;

        if ($order) {
            foreach ($order->items->groupBy('vendor_id') as $vendorId => $items) {
                if (! $vendorId) {
                    continue;
                }

                $vendor = Vendor::query()->find($vendorId);

                if ($vendor === null) {
                    continue;
                }

                $earnings = new Earnings($vendor);
                $gross = round((float) $items->sum(fn ($item) => (float) $item->line_total), 2);
                $commission = round((float) $items->sum(fn ($item) => $earnings->commissionFor($item)), 2);
                $net = round($gross - $commission, 2);
                $vendorWallet = $this->vendorWallet($vendor);

                if ($net > 0) {
                    $lines[] = ['account' => $vendorWallet->account, 'debit' => 0, 'credit' => $net, 'memo' => $order->number];
                    $effects[] = $this->effect($vendorWallet, 'credit', $net, 'earning', 'Net earnings '.$order->number, $order->id, $payment->id);
                }

                if ($commission > 0) {
                    $lines[] = ['account' => $this->system(self::COMMISSION, 'Marketplace commission', 'income'), 'debit' => 0, 'credit' => $commission];
                }

                $credited += $net + $commission;
            }

            $shipping = round((float) $order->shipping_fee, 2);

            if ($shipping > 0) {
                $lines[] = ['account' => $this->system(self::DELIVERY, 'Delivery income', 'income'), 'debit' => 0, 'credit' => $shipping];
                $credited += $shipping;
            }
        }

        $credited = round($credited, 2);
        $gap = round($amount - $credited, 2);
        $suspicious = abs($gap) > 0.009;

        if ($gap > 0.009) {
            $lines[] = ['account' => $this->system(self::SUSPENSE, 'Unallocated receipts', 'liability'), 'debit' => 0, 'credit' => $gap];
        } elseif ($gap < -0.009) {
            $lines[] = ['account' => $this->system(self::SUSPENSE, 'Unallocated receipts', 'liability'), 'debit' => abs($gap), 'credit' => 0];
        }

        if ($fromWallet) {
            $wallet = $this->customerWallet($order->user);
            $lines[] = ['account' => $wallet->account, 'debit' => $amount, 'credit' => 0];
            $effects[] = $this->effect($wallet, 'debit', $amount, 'payment', 'Order '.$order->number, $order->id, $payment->id, null, $suspicious);
        } else {
            $fee = round($amount * (float) MarketplaceSettings::get('gateway_fee_percent', 0) / 100, 2);
            $lines[] = ['account' => $this->system(self::CLEARING, 'Payment provider clearing', 'asset'), 'debit' => round($amount - $fee, 2), 'credit' => 0];

            if ($fee > 0) {
                $lines[] = ['account' => $this->system(self::FEES, 'Payment gateway fees', 'expense'), 'debit' => $fee, 'credit' => 0];
            }
        }

        return $this->post('sale:'.$payment->id, 'Sale '.$payment->reference, $lines, $effects, $payment);
    }

    private function system(string $code, string $name, string $type): LedgerAccount
    {
        return LedgerAccount::query()->firstOrCreate(
            ['code' => $code],
            ['name' => $name, 'type' => $type, 'is_system' => true],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function effect(Wallet $wallet, string $direction, float $amount, string $type, string $description, ?int $orderId = null, ?int $paymentId = null, ?string $reference = null, bool $suspicious = false): array
    {
        return [
            'wallet' => $wallet,
            'direction' => $direction,
            'amount' => round($amount, 2),
            'type' => $type,
            'description' => $description,
            'order_id' => $orderId,
            'payment_id' => $paymentId,
            'reference' => $reference,
            'suspicious' => $suspicious,
        ];
    }

    private function guard(Wallet $wallet): void
    {
        if ($wallet->isFrozen()) {
            throw ValidationException::withMessages([
                'wallet' => 'This wallet is frozen.',
            ]);
        }
    }

    private function reference(string $prefix): string
    {
        return $prefix.'-'.now()->format('ymdHis').'-'.strtoupper(Str::random(4));
    }
}
