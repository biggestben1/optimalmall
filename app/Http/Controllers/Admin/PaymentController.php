<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Enums\PayoutStatus;
use App\Enums\SettlementStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Settlement;
use App\Services\Accounting\Books;
use App\Services\Vendor\AuditLogger;
use App\Services\Vendor\Earnings;
use App\Support\AccountantGate;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        $payments = Payment::query()
            ->with('order')
            ->latest()
            ->paginate(15, ['*'], 'payments_page')
            ->withQueryString()
            ->through(fn (Payment $payment) => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'order_number' => $payment->order?->number,
                'method' => ucfirst($payment->method),
                'amount' => Money::format($payment->amount),
                'status' => $payment->status->label(),
                'verified' => $payment->status === PaymentStatus::Successful,
                'paid_at' => $payment->paid_at?->format('d M Y'),
            ]);

        $settlements = Settlement::query()
            ->with('vendor')
            ->latest()
            ->paginate(15, ['*'], 'settlements_page')
            ->withQueryString()
            ->through(fn (Settlement $settlement) => [
                'id' => $settlement->id,
                'reference' => $settlement->reference,
                'vendor' => $settlement->vendor?->name,
                'amount' => Money::format($settlement->amount),
                'status' => $settlement->status->value,
                'status_label' => $settlement->status->label(),
                'period' => $settlement->period_start->format('d M').' – '.$settlement->period_end->format('d M Y'),
            ]);

        $payouts = Payout::query()
            ->with('vendor')
            ->latest()
            ->paginate(15, ['*'], 'payouts_page')
            ->withQueryString()
            ->through(fn (Payout $payout) => [
                'id' => $payout->id,
                'reference' => $payout->reference,
                'vendor' => $payout->vendor?->name,
                'amount' => Money::format($payout->amount),
                'status' => $payout->status->value,
                'status_label' => $payout->status->label(),
            ]);

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'settlements' => $settlements,
            'payouts' => $payouts,
        ]);
    }

    public function approve(Payout $payout): RedirectResponse
    {
        abort_unless(app(Books::class)->canApprovePayout(auth()->user(), $payout), 403);
        abort_unless($payout->status === PayoutStatus::Requested, 422);
        abort_unless($payout->vendor && (new Earnings($payout->vendor))->canRelease($payout), 422, 'Verified payments do not cover this payout.');

        $payout->update([
            'status' => PayoutStatus::Approved,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);
        AuditLogger::record('payout.approved', $payout, ['amount' => $payout->amount], $payout->vendor, auth()->user());

        return back()->with('status', 'Payout approved. Approval does not mean it has been paid.');
    }

    public function reject(Payout $payout): RedirectResponse
    {
        abort_unless(in_array($payout->status, [PayoutStatus::Requested, PayoutStatus::Approved], true), 422);

        $payout->update(['status' => PayoutStatus::Rejected]);
        $payout->vendor?->notifyPortal('Payout rejected', $payout->reference.' was not paid.');
        AuditLogger::record('payout.rejected', $payout, ['amount' => $payout->amount], $payout->vendor, auth()->user());

        return back()->with('status', 'Payout rejected. The amount is no longer reserved.');
    }

    public function release(Payout $payout): RedirectResponse
    {
        abort_unless(AccountantGate::allows(auth()->user(), 'payouts.execute'), 403);
        abort_unless($payout->status === PayoutStatus::Approved, 422);
        abort_unless($payout->vendor && (new Earnings($payout->vendor))->canRelease($payout), 422, 'Verified payments do not cover this payout.');

        $payout->update([
            'status' => PayoutStatus::Processing,
            'initiated_by' => auth()->id(),
            'initiated_at' => now(),
        ]);
        $payout->vendor->notifyPortal('Payout payment started', $payout->reference.' is with the bank. It is not paid yet.');
        AuditLogger::record('payout.started', $payout, ['amount' => $payout->amount], $payout->vendor, auth()->user());

        return redirect()->route('admin.payments.index')->with('status', 'Payout payment started. Confirm it after the bank settles.');
    }

    public function confirm(Request $request, Payout $payout, Books $books): RedirectResponse
    {
        abort_unless(AccountantGate::allows($request->user(), 'payouts.confirm'), 403);

        $data = $request->validate([
            'password' => ['required', 'current_password'],
            'provider_reference' => ['required', 'string', 'max:120'],
        ]);

        $books->confirmPayout($payout, $request->user(), $data['provider_reference']);
        $payout->vendor?->notifyPortal('Payout settled', $payout->reference.' has been paid.');

        return back()->with('status', 'Payout settled and posted to the ledger.');
    }

    public function update(Settlement $settlement): RedirectResponse
    {
        abort_if($settlement->status === SettlementStatus::Paid, 422, 'This settlement is already paid.');

        $settlement->update([
            'status' => SettlementStatus::Paid,
            'paid_at' => now(),
        ]);
        AuditLogger::record('settlement.paid', $settlement, ['amount' => $settlement->amount], $settlement->vendor, auth()->user());

        return redirect()->route('admin.payments.index')->with('status', 'Settlement marked as paid.');
    }
}
