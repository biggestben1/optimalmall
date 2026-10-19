<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\PaymentEvent;
use App\Models\WalletTransaction;
use App\Services\Accounting\Books;
use App\Services\Vendor\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentWebhookController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $secret = (string) config('services.payments.webhook_secret');
        abort_unless($secret !== '', 404);

        $signature = (string) $request->header('X-Payment-Signature');
        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        $valid = strlen($signature) === strlen($expected) && hash_equals($expected, $signature);
        abort_unless($valid, 401);

        $data = $request->validate([
            'reference' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:40'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $payment = Payment::query()->where('reference', $data['reference'])->first();

        if ($payment === null) {
            return response()->json(['message' => 'Unknown payment reference.'], 404);
        }

        $alreadyPaid = $payment->status === PaymentStatus::Successful;

        PaymentEvent::query()->create([
            'payment_id' => $payment->id,
            'reference' => $payment->reference,
            'status' => $alreadyPaid ? 'duplicate' : $data['status'],
            'source' => 'webhook',
            'amount' => $data['amount'] ?? $payment->amount,
        ]);

        if ($alreadyPaid) {
            return response()->json(['ok' => true, 'duplicate' => true]);
        }

        if ($data['status'] !== 'successful') {
            WalletTransaction::query()
                ->where('payment_id', $payment->id)
                ->where('status', 'pending')
                ->update(['status' => 'failed', 'suspicious' => true]);

            return response()->json(['ok' => true, 'duplicate' => false]);
        }

        if (isset($data['amount']) && abs((float) $data['amount'] - (float) $payment->amount) > 0.009) {
            WalletTransaction::query()
                ->where('payment_id', $payment->id)
                ->where('status', 'pending')
                ->update(['suspicious' => true]);

            return response()->json(['message' => 'Amount does not match the recorded payment.'], 422);
        }

        DB::transaction(function () use ($payment) {
            $payment->update([
                'status' => PaymentStatus::Successful,
                'paid_at' => now(),
            ]);
            app(Books::class)->recordVerifiedPayment($payment->fresh());
            AuditLogger::record('payment.verified', $payment, ['reference' => $payment->reference]);
        });

        return response()->json(['ok' => true, 'duplicate' => false]);
    }
}
