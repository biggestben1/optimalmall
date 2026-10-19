<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Services\Accounting\Books;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CustomerWalletController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if ($user === null || ! Hash::check($data['password'], $user->password) || ! $user->isCustomer()) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match a customer account.',
            ]);
        }

        return response()->json([
            'token' => $user->createToken($data['device_name'] ?? 'mobile')->plainTextToken,
            'token_type' => 'Bearer',
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function show(Request $request, Books $books): JsonResponse
    {
        abort_unless($request->user()->isCustomer(), 403);
        $wallet = $books->customerWallet($request->user());

        return response()->json([
            'balance' => $wallet->balance(),
            'currency' => $wallet->currency,
            'status' => $wallet->status,
        ]);
    }

    public function transactions(Request $request, Books $books): JsonResponse
    {
        abort_unless($request->user()->isCustomer(), 403);
        $wallet = $books->customerWallet($request->user());

        return response()->json(
            $wallet->transactions()->latest()->paginate(20)->through(fn ($transaction) => [
                'reference' => $transaction->reference,
                'type' => $transaction->type,
                'direction' => $transaction->direction,
                'amount' => (float) $transaction->amount,
                'balance_after' => $transaction->balance_after !== null ? (float) $transaction->balance_after : null,
                'status' => $transaction->status,
                'description' => $transaction->description,
                'created_at' => $transaction->created_at?->toIso8601String(),
            ])
        );
    }

    public function fund(Request $request, Books $books): JsonResponse
    {
        abort_unless($request->user()->isCustomer(), 403);
        $data = $request->validate(['amount' => ['required', 'numeric', 'min:1']]);
        $payment = $books->startDeposit($request->user(), (float) $data['amount']);

        return response()->json([
            'reference' => $payment->reference,
            'amount' => (float) $payment->amount,
            'status' => $payment->status->value,
        ], 201);
    }

    public function pay(Request $request, Order $order, Books $books): JsonResponse
    {
        abort_unless($request->user()->isCustomer(), 403);
        $payment = $books->payOrder($request->user(), $order);

        return response()->json([
            'reference' => $payment->reference,
            'order' => $order->number,
            'status' => $payment->status->value,
        ]);
    }
}
