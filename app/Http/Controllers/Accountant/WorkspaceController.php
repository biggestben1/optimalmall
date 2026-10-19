<?php

namespace App\Http\Controllers\Accountant;

use App\Enums\PayoutStatus;
use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use App\Models\Expense;
use App\Models\JournalEntry;
use App\Models\OrderReturn;
use App\Models\Payout;
use App\Models\Reconciliation;
use App\Models\Wallet;
use App\Models\WalletAdjustment;
use App\Models\WalletFundingRequest;
use App\Models\WalletTransaction;
use App\Services\Accounting\Books;
use App\Services\Vendor\AuditLogger;
use App\Support\AccountantGate;
use App\Support\MarketplaceSettings;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WorkspaceController extends Controller
{
    public function dashboard(Books $books): Response
    {
        $books->syncMissingSales();
        $numbers = $books->indicators();

        return Inertia::render('Accountant/Dashboard', [
            'stats' => [
                ['label' => 'Payments received', 'value' => Money::format($numbers['payments'])],
                ['label' => 'Refunds', 'value' => Money::format($numbers['refunds'])],
                ['label' => 'Commission income', 'value' => Money::format($numbers['commission'])],
                ['label' => 'Seller payables', 'value' => Money::format($numbers['vendor_payables'])],
                ['label' => 'Customer wallet liabilities', 'value' => Money::format($numbers['customer_liabilities'])],
                ['label' => 'Pending payouts', 'value' => Money::format($numbers['pending_payouts'])],
                ['label' => 'Gateway fees', 'value' => Money::format($numbers['gateway_fees'])],
                ['label' => 'Bank settlement', 'value' => Money::format($numbers['bank'])],
                ['label' => 'Provider clearing', 'value' => Money::format($numbers['clearing'])],
                ['label' => 'Unreconciled items', 'value' => (string) $numbers['unreconciled']],
                ['label' => 'Funding receipts waiting', 'value' => (string) WalletFundingRequest::query()->where('status', 'pending')->count()],
            ],
        ]);
    }

    public function funding(): Response
    {
        $requests = WalletFundingRequest::query()
            ->with('user')
            ->latest()
            ->paginate(20)
            ->through(fn (WalletFundingRequest $funding) => [
                'id' => $funding->id,
                'customer' => $funding->user?->name,
                'email' => $funding->user?->email,
                'amount' => Money::format($funding->amount),
                'status' => ucfirst($funding->status),
                'pending' => $funding->status === 'pending',
                'note' => $funding->review_note,
                'created_at' => $funding->created_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('Accountant/Funding', [
            'requests' => $requests,
        ]);
    }

    public function fundingProof(WalletFundingRequest $funding): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($funding->proof_path), 404);

        return Storage::disk('local')->response($funding->proof_path);
    }

    public function approveFunding(WalletFundingRequest $funding, Books $books): RedirectResponse
    {
        $books->approveFunding($funding, auth()->user());

        return back()->with('status', 'Funding approved. The customer wallet is credited.');
    }

    public function rejectFunding(Request $request, WalletFundingRequest $funding, Books $books): RedirectResponse
    {
        $data = $request->validate([
            'review_note' => ['nullable', 'string', 'max:255'],
        ]);

        $books->rejectFunding($funding, $request->user(), $data['review_note'] ?? null);

        return back()->with('status', 'Funding request rejected. The wallet was not credited.');
    }

    public function transactions(Request $request): Response|StreamedResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'transactions.view'), 403);
        $query = $this->transactionQuery($request);

        if ($request->boolean('export')) {
            abort_unless(AccountantGate::allows($request->user(), 'transactions.export'), 403);

            return response()->streamDownload(function () use ($query) {
                $out = fopen('php://output', 'w');
                fputcsv($out, ['Date', 'Wallet', 'Reference', 'Type', 'Direction', 'Amount', 'Status', 'Description']);
                $query->limit(5000)->get()->each(function (WalletTransaction $transaction) use ($out) {
                    fputcsv($out, [
                        $transaction->created_at?->toDateTimeString(),
                        $transaction->wallet?->type,
                        $transaction->reference,
                        $transaction->type,
                        $transaction->direction,
                        $transaction->amount,
                        $transaction->status,
                        $transaction->description,
                    ]);
                });
                fclose($out);
            }, 'wallet-transactions.csv', ['Content-Type' => 'text/csv']);
        }

        return Inertia::render('Accountant/Transactions', [
            'transactions' => $query->paginate(20)->withQueryString()->through(fn (WalletTransaction $transaction) => $this->transactionRow($transaction)),
            'filters' => $request->only(['search', 'status', 'type', 'from', 'to']),
        ]);
    }

    public function wallets(Request $request): Response
    {
        abort_unless(AccountantGate::allows($request->user(), 'transactions.view'), 403);
        $search = $request->string('search')->trim()->toString();

        $wallets = Wallet::query()
            ->with(['user:id,name,email', 'vendor:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->whereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('vendor', fn ($vendor) => $vendor->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Wallet $wallet) => [
                'id' => $wallet->id,
                'owner' => $wallet->user?->name ?? $wallet->vendor?->name,
                'type' => ucfirst($wallet->type),
                'status' => $wallet->status,
                'balance' => Money::format($wallet->balance()),
            ]);

        return Inertia::render('Accountant/Wallets', [
            'wallets' => $wallets,
            'account' => [
                'bank' => (string) MarketplaceSettings::get('funding_bank', ''),
                'name' => (string) MarketplaceSettings::get('funding_account_name', ''),
                'number' => (string) MarketplaceSettings::get('funding_account_number', ''),
            ],
            'filters' => ['search' => $search],
            'can_freeze' => AccountantGate::allows($request->user(), 'wallets.freeze'),
            'can_prepare' => AccountantGate::allows($request->user(), 'adjustments.prepare'),
            'can_approve' => AccountantGate::allows($request->user(), 'adjustments.approve'),
            'adjustments' => WalletAdjustment::query()->with('wallet.user', 'wallet.vendor')->latest()->limit(20)->get()->map(fn (WalletAdjustment $adjustment) => [
                'id' => $adjustment->id,
                'owner' => $adjustment->wallet?->user?->name ?? $adjustment->wallet?->vendor?->name,
                'direction' => $adjustment->direction,
                'amount' => Money::format($adjustment->amount),
                'reason' => $adjustment->reason,
                'status' => $adjustment->status,
            ]),
        ]);
    }

    public function updateFundingAccount(Request $request): RedirectResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'transactions.view'), 403);

        $data = $request->validate([
            'funding_bank' => ['required', 'string', 'max:80'],
            'funding_account_name' => ['required', 'string', 'max:120'],
            'funding_account_number' => ['required', 'string', 'max:20'],
        ]);

        MarketplaceSettings::put($data);
        AuditLogger::record('wallet.funding_account', null, [
            'bank' => $data['funding_bank'],
            'account_name' => $data['funding_account_name'],
        ], null, $request->user());

        return back()->with('status', 'Top-up account saved. Customers see it when they add money to a wallet.');
    }

    public function freeze(Request $request, Wallet $wallet): RedirectResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'wallets.freeze'), 403);
        $request->validate(['password' => ['required', 'current_password']]);
        $wallet->update(['status' => $wallet->isFrozen() ? 'active' : 'frozen']);
        AuditLogger::record('wallet.freeze', $wallet, ['status' => $wallet->status], $wallet->vendor, $request->user());

        return back()->with('status', $wallet->isFrozen() ? 'Wallet frozen.' : 'Wallet unfrozen.');
    }

    public function adjust(Request $request, Wallet $wallet, Books $books): RedirectResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'adjustments.prepare'), 403);
        $data = $request->validate([
            'direction' => ['required', 'in:credit,debit'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
        ]);
        $books->prepareAdjustment($wallet, $data['direction'], (float) $data['amount'], $data['reason'], $request->user());

        return back()->with('status', 'Adjustment prepared. It is not posted until a different authorised person approves it.');
    }

    public function approveAdjustment(Request $request, WalletAdjustment $adjustment, Books $books): RedirectResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'adjustments.approve'), 403);
        $request->validate(['password' => ['required', 'current_password']]);
        $books->approveAdjustment($adjustment, $request->user());

        return back()->with('status', 'Adjustment posted to the ledger.');
    }

    public function reconcile(Request $request, Books $books): Response|RedirectResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'reconcile'), 403);

        if ($request->isMethod('post')) {
            $data = $request->validate([
                'source' => ['required', 'in:gateway,bank'],
                'period_start' => ['required', 'date'],
                'period_end' => ['required', 'date', 'after_or_equal:period_start'],
                'statement_amount' => ['required', 'numeric', 'min:0'],
                'notes' => ['nullable', 'string', 'max:1000'],
            ]);
            $books->reconcile($request->user(), $data['source'], $data['period_start'], $data['period_end'], (float) $data['statement_amount'], $data['notes'] ?? null);

            return back()->with('status', 'Reconciliation saved. Posted payments were not changed.');
        }

        return Inertia::render('Accountant/Reconcile', [
            'rows' => Reconciliation::query()->latest()->paginate(20)->through(fn (Reconciliation $row) => [
                'id' => $row->id,
                'reference' => $row->reference,
                'source' => ucfirst($row->source),
                'period' => $row->period_start->format('d M').' – '.$row->period_end->format('d M Y'),
                'expected' => Money::format($row->expected_amount),
                'statement' => Money::format($row->statement_amount),
                'difference' => Money::format($row->difference),
                'status' => ucfirst($row->status),
            ]),
        ]);
    }

    public function payouts(Request $request): Response
    {
        abort_unless(AccountantGate::allows($request->user(), 'payouts.review'), 403);

        $payouts = Payout::query()->with('vendor:id,name', 'bankAccount')->latest()->paginate(20)->through(fn (Payout $payout) => [
            'id' => $payout->id,
            'reference' => $payout->reference,
            'vendor' => $payout->vendor?->name,
            'amount' => Money::format($payout->amount),
            'status' => $payout->status->value,
            'status_label' => $payout->status->label(),
            'bank' => $payout->bankAccount ? $payout->bankAccount->bank_name.' · '.$payout->bankAccount->account_number : 'No verified account',
            'provider_reference' => $payout->provider_reference,
            'can_approve' => $payout->status === PayoutStatus::Requested && app(Books::class)->canApprovePayout($request->user(), $payout),
            'can_start' => $payout->status === PayoutStatus::Approved && AccountantGate::allows($request->user(), 'payouts.execute'),
            'can_confirm' => $payout->status === PayoutStatus::Processing && AccountantGate::allows($request->user(), 'payouts.confirm'),
        ]);

        return Inertia::render('Accountant/Payouts', [
            'payouts' => $payouts,
            'threshold' => Money::format(AccountantGate::threshold()),
        ]);
    }

    public function refunds(): Response
    {
        abort_unless(AccountantGate::allows(auth()->user(), 'transactions.view'), 403);

        $returns = OrderReturn::query()->with('order')->latest()->paginate(20)->through(fn (OrderReturn $return) => [
            'id' => $return->id,
            'order' => $return->order?->number,
            'amount' => Money::format($return->refund_amount),
            'status' => $return->status->label(),
            'posted' => JournalEntry::query()->where('idempotency_key', 'refund:'.$return->id)->exists(),
        ]);

        return Inertia::render('Accountant/Refunds', ['returns' => $returns]);
    }

    public function expenses(Request $request): Response|RedirectResponse
    {
        if ($request->isMethod('post')) {
            abort_unless(AccountantGate::allows($request->user(), 'expenses.record'), 403);
            $data = $request->validate([
                'category' => ['required', 'in:rent,logistics,marketing,software,other'],
                'amount' => ['required', 'numeric', 'min:0.01'],
                'spent_on' => ['required', 'date'],
                'description' => ['required', 'string', 'max:255'],
                'attachment' => ['nullable', 'file', 'max:4096'],
            ]);
            $path = $request->file('attachment')?->store('expenses', 'local');
            Expense::query()->create([
                'category' => $data['category'],
                'amount' => $data['amount'],
                'spent_on' => $data['spent_on'],
                'description' => $data['description'],
                'attachment_path' => $path,
                'status' => 'submitted',
                'user_id' => $request->user()->id,
            ]);

            return back()->with('status', 'Expense submitted for approval.');
        }

        return Inertia::render('Accountant/Expenses', [
            'expenses' => Expense::query()->latest()->paginate(20)->through(fn (Expense $expense) => [
                'id' => $expense->id,
                'category' => ucfirst($expense->category),
                'amount' => Money::format($expense->amount),
                'spent_on' => $expense->spent_on->format('d M Y'),
                'description' => $expense->description,
                'status' => ucfirst($expense->status),
                'can_approve' => $expense->status === 'submitted' && AccountantGate::allows($request->user(), 'expenses.approve') && ($request->user()->isSuperAdmin() || $expense->user_id !== $request->user()->id),
            ]),
            'can_record' => AccountantGate::allows($request->user(), 'expenses.record'),
        ]);
    }

    public function approveExpense(Request $request, Expense $expense, Books $books): RedirectResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'expenses.approve'), 403);
        $request->validate(['password' => ['required', 'current_password']]);
        $books->approveExpense($expense, $request->user());

        return back()->with('status', 'Expense approved and posted.');
    }

    public function ledger(Request $request, Books $books): Response
    {
        abort_unless(AccountantGate::allows($request->user(), 'ledger.view'), 403);

        return Inertia::render('Accountant/Ledger', [
            'accounts' => collect($books->trialBalance())->map(fn (array $row) => [
                ...$row,
                'balance' => Money::format($row['balance']),
            ]),
            'entries' => JournalEntry::query()->latest('posted_at')->paginate(20)->through(fn (JournalEntry $entry) => [
                'reference' => $entry->reference,
                'description' => $entry->description,
                'posted_at' => $entry->posted_at->format('d M Y H:i'),
            ]),
        ]);
    }

    public function reports(Books $books): Response
    {
        abort_unless(AccountantGate::allows(auth()->user(), 'reports.view'), 403);
        $books->syncMissingSales();

        return Inertia::render('Accountant/Reports', [
            'stats' => collect($books->indicators())->map(fn ($value, $key) => [
                'label' => str_replace('_', ' ', ucfirst($key)),
                'value' => is_int($value) ? (string) $value : Money::format($value),
            ])->values(),
        ]);
    }

    public function periods(Request $request, Books $books): Response|RedirectResponse
    {
        if ($request->isMethod('post')) {
            abort_unless(AccountantGate::allows($request->user(), 'periods.close'), 403);
            $data = $request->validate([
                'label' => ['required', 'string', 'max:120'],
                'starts_on' => ['required', 'date'],
                'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
                'notes' => ['nullable', 'string', 'max:1000'],
                'password' => ['required', 'current_password'],
            ]);
            $books->closePeriod($request->user(), $data['label'], $data['starts_on'], $data['ends_on'], $data['notes'] ?? null);

            return back()->with('status', 'Period closed. The snapshot is stored with the closing record.');
        }

        return Inertia::render('Accountant/Periods', [
            'periods' => AccountingPeriod::query()->latest()->paginate(20)->through(fn ($period) => [
                'label' => $period->label,
                'range' => $period->starts_on->format('d M').' – '.$period->ends_on->format('d M Y'),
                'status' => ucfirst($period->status),
                'differences' => $period->has_differences ? 'Differences flagged' : 'Clear',
            ]),
            'can_close' => AccountantGate::allows($request->user(), 'periods.close'),
        ]);
    }

    public function policy(Request $request): Response|RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        if ($request->isMethod('put')) {
            $data = $request->validate([
                'wallet_deposits_enabled' => ['required', 'boolean'],
                'wallet_payments_enabled' => ['required', 'boolean'],
                'wallet_refunds_to_wallet' => ['required', 'boolean'],
                'wallet_transaction_limit' => ['required', 'numeric', 'min:1'],
                'wallet_daily_limit' => ['required', 'numeric', 'min:1'],
                'wallet_max_balance' => ['required', 'numeric', 'min:1'],
                'gateway_fee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
                'payout_approval_threshold' => ['required', 'numeric', 'min:1'],
                'permissions' => ['array'],
                'permissions.*' => ['string'],
            ]);

            if ($data['wallet_deposits_enabled'] && ! $request->boolean('regulatory_confirmed')) {
                return back()->with('error', 'Confirm the licensed provider and the applicable Nigerian rules before accepting customer deposits.');
            }

            MarketplaceSettings::put([
                'wallet_deposits_enabled' => $data['wallet_deposits_enabled'] ? '1' : '0',
                'wallet_payments_enabled' => $data['wallet_payments_enabled'] ? '1' : '0',
                'wallet_refunds_to_wallet' => $data['wallet_refunds_to_wallet'] ? '1' : '0',
                'wallet_transaction_limit' => $data['wallet_transaction_limit'],
                'wallet_daily_limit' => $data['wallet_daily_limit'],
                'wallet_max_balance' => $data['wallet_max_balance'],
                'gateway_fee_percent' => $data['gateway_fee_percent'],
                'payout_approval_threshold' => $data['payout_approval_threshold'],
                'accountant_permissions' => json_encode(array_values(array_intersect($data['permissions'] ?? [], array_keys(AccountantGate::actions())))),
            ]);
            AuditLogger::record('wallet.policy', null, ['deposits' => (bool) $data['wallet_deposits_enabled']], null, $request->user());

            return back()->with('status', 'Wallet policy saved.');
        }

        return Inertia::render('Accountant/Policy', [
            'settings' => [
                'wallet_deposits_enabled' => MarketplaceSettings::enabled('wallet_deposits_enabled'),
                'wallet_payments_enabled' => MarketplaceSettings::enabled('wallet_payments_enabled', true),
                'wallet_refunds_to_wallet' => MarketplaceSettings::enabled('wallet_refunds_to_wallet', true),
                'wallet_transaction_limit' => (float) MarketplaceSettings::get('wallet_transaction_limit', 500000),
                'wallet_daily_limit' => (float) MarketplaceSettings::get('wallet_daily_limit', 1000000),
                'wallet_max_balance' => (float) MarketplaceSettings::get('wallet_max_balance', 5000000),
                'gateway_fee_percent' => (float) MarketplaceSettings::get('gateway_fee_percent', 0),
                'payout_approval_threshold' => AccountantGate::threshold(),
            ],
            'actions' => collect(AccountantGate::actions())->map(fn ($label, $key) => [
                'key' => $key,
                'label' => $label,
                'enabled' => in_array($key, AccountantGate::granted(), true),
            ])->values(),
        ]);
    }

    private function transactionQuery(Request $request)
    {
        $search = $request->string('search')->trim()->toString();

        return WalletTransaction::query()
            ->with('wallet.user:id,name', 'wallet.vendor:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('reference', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')))
            ->when($request->boolean('suspicious'), fn ($query) => $query->where('suspicious', true))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('created_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('created_at', '<=', $request->date('to')))
            ->latest();
    }

    /**
     * @return array<string, mixed>
     */
    private function transactionRow(WalletTransaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'owner' => $transaction->wallet?->user?->name ?? $transaction->wallet?->vendor?->name,
            'reference' => $transaction->reference,
            'type' => $transaction->type,
            'direction' => $transaction->direction,
            'amount' => Money::format($transaction->amount),
            'status' => $transaction->status,
            'suspicious' => $transaction->suspicious,
            'description' => $transaction->description,
            'created_at' => $transaction->created_at?->format('d M Y H:i'),
        ];
    }
}
