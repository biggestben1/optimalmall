<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PayoutStatus;
use App\Enums\SettlementStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Settlement;
use App\Services\Vendor\AuditLogger;
use App\Services\Vendor\Earnings;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
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

    public function release(Payout $payout): RedirectResponse
    {
        abort_unless(in_array($payout->status, [PayoutStatus::Requested, PayoutStatus::Approved], true), 422);
        abort_unless($payout->vendor && (new Earnings($payout->vendor))->canRelease($payout), 422, 'Verified payments do not cover this payout.');

        $payout->update([
            'status' => PayoutStatus::Paid,
            'paid_at' => now(),
        ]);
        $payout->vendor->notifyPortal('Payout released', $payout->reference.' has been paid.');
        AuditLogger::record('payout.released', $payout, ['amount' => $payout->amount], $payout->vendor, auth()->user());

        return redirect()->route('admin.payments.index')->with('status', 'Payout released.');
    }

    public function update(Settlement $settlement): RedirectResponse
    {
        $settlement->update([
            'status' => SettlementStatus::Paid,
            'paid_at' => now(),
        ]);

        return redirect()->route('admin.payments.index')->with('status', 'Settlement marked as paid.');
    }
}
