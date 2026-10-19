<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SettlementStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Settlement;
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

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'settlements' => $settlements,
        ]);
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
