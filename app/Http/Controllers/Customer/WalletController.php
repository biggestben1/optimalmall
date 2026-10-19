<?php

namespace App\Http\Controllers\Customer;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\WalletFundingRequest;
use App\Models\WalletTransaction;
use App\Services\Accounting\Books;
use App\Support\MarketplaceSettings;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WalletController extends Controller
{
    public function index(Request $request, Books $books): Response
    {
        $wallet = $books->customerWallet($request->user());
        $transactions = $wallet->transactions()->latest()->paginate(15)->withQueryString()->through(fn (WalletTransaction $transaction) => $this->row($transaction));

        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->whereDoesntHave('payments', fn ($query) => $query->where('status', PaymentStatus::Successful))
            ->latest('placed_at')
            ->limit(10)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'total' => Money::format($order->total),
            ]);

        return Inertia::render('Customer/Wallet/Index', [
            'balance' => Money::format($wallet->balance()),
            'frozen' => $wallet->isFrozen(),
            'deposits_enabled' => MarketplaceSettings::enabled('wallet_deposits_enabled'),
            'payments_enabled' => MarketplaceSettings::enabled('wallet_payments_enabled', true),
            'limits' => [
                'transaction' => Money::format(MarketplaceSettings::get('wallet_transaction_limit', 500000)),
                'daily' => Money::format(MarketplaceSettings::get('wallet_daily_limit', 1000000)),
                'balance' => Money::format(MarketplaceSettings::get('wallet_max_balance', 5000000)),
            ],
            'transactions' => $transactions,
            'orders' => $orders,
            'funding' => WalletFundingRequest::query()
                ->where('user_id', $request->user()->id)
                ->latest()
                ->take(8)
                ->get()
                ->map(fn (WalletFundingRequest $funding) => [
                    'id' => $funding->id,
                    'amount' => Money::format($funding->amount),
                    'status' => ucfirst($funding->status),
                    'note' => $funding->review_note,
                    'created_at' => $funding->created_at?->format('d M Y H:i'),
                ]),
            'account' => [
                'bank' => (string) MarketplaceSettings::get('funding_bank', ''),
                'name' => (string) MarketplaceSettings::get('funding_account_name', ''),
                'number' => (string) MarketplaceSettings::get('funding_account_number', ''),
            ],
        ]);
    }

    public function fundWithProof(Request $request, Books $books): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],
        ]);

        $path = $request->file('proof')->store('funding-proofs/'.$request->user()->id, 'local');

        try {
            $books->submitFundingProof($request->user(), (float) $data['amount'], $path);
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        return back()->with('status', 'Receipt received. Your balance changes only after an accountant approves it.');
    }

    public function fund(Request $request, Books $books): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $payment = $books->startDeposit($request->user(), (float) $data['amount']);

        return back()->with('status', 'Funding reference '.$payment->reference.' is waiting for the payment provider. The wallet is credited only after that payment is verified.');
    }

    public function pay(Request $request, Order $order, Books $books): RedirectResponse
    {
        $books->payOrder($request->user(), $order);

        return back()->with('status', 'Order '.$order->number.' was paid from your wallet.');
    }

    public function statement(Request $request, Books $books): StreamedResponse
    {
        $wallet = $books->customerWallet($request->user());
        $rows = $wallet->transactions()->latest()->get();

        return response()->streamDownload(function () use ($wallet, $rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['OptimalMall wallet statement']);
            fputcsv($out, ['Balance', $wallet->balance()]);
            fputcsv($out, ['Date', 'Reference', 'Type', 'Direction', 'Amount', 'Balance', 'Status', 'Description']);
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->created_at?->toDateTimeString(),
                    $row->reference,
                    $row->type,
                    $row->direction,
                    $row->amount,
                    $row->balance_after,
                    $row->status,
                    $row->description,
                ]);
            }
            fclose($out);
        }, 'wallet-statement.csv', ['Content-Type' => 'text/csv']);
    }

    public function receipt(Request $request, WalletTransaction $transaction, Books $books): Response
    {
        $wallet = $books->customerWallet($request->user());
        abort_unless($transaction->wallet_id === $wallet->id, 404);

        return Inertia::render('Customer/Wallet/Receipt', [
            'transaction' => $this->row($transaction),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function row(WalletTransaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'reference' => $transaction->reference,
            'type' => ucfirst($transaction->type),
            'direction' => $transaction->direction,
            'amount' => Money::format($transaction->amount),
            'balance_after' => $transaction->balance_after !== null ? Money::format($transaction->balance_after) : null,
            'status' => ucfirst($transaction->status),
            'description' => $transaction->description,
            'created_at' => $transaction->created_at?->format('d M Y H:i'),
        ];
    }
}
