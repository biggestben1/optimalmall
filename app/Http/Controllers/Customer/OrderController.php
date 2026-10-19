<?php

namespace App\Http\Controllers\Customer;

use App\Enums\OrderStatus;
use App\Enums\ReturnStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReturn;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->latest('placed_at')
            ->paginate(12)
            ->through(fn (Order $order) => [
                'number' => $order->number,
                'status' => $order->status->label(),
                'total' => Money::format($order->total),
                'placed_at' => $order->placed_at?->format('d M Y'),
            ]);

        return Inertia::render('Customer/Orders/Index', ['orders' => $orders]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        $order->load(['items', 'returns']);

        return Inertia::render('Customer/Orders/Show', [
            'order' => $this->payload($order),
        ]);
    }

    public function returnItem(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        abort_unless(in_array($order->status, [OrderStatus::Paid, OrderStatus::Shipped, OrderStatus::Delivered], true), 422);

        if ($order->returns()->whereIn('status', [ReturnStatus::Requested, ReturnStatus::Approved, ReturnStatus::Refunded])->exists()) {
            return back()->with('error', 'A return is already open for this order.');
        }

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'refund_amount' => ['required', 'numeric', 'min:1'],
        ]);

        if ((float) $data['refund_amount'] > (float) $order->total + 0.009) {
            return back()->withErrors(['refund_amount' => 'The refund cannot be more than the order total.']);
        }

        OrderReturn::query()->create([
            'order_id' => $order->id,
            'reason' => $data['reason'],
            'status' => ReturnStatus::Requested,
            'refund_amount' => $data['refund_amount'],
        ]);

        return back()->with('status', 'Return requested. It is not refunded until the mall approves it.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Order $order): array
    {
        return [
            'number' => $order->number,
            'status' => $order->status->label(),
            'can_return' => in_array($order->status, [OrderStatus::Paid, OrderStatus::Shipped, OrderStatus::Delivered], true)
                && $order->returns->whereIn('status', [ReturnStatus::Requested, ReturnStatus::Approved, ReturnStatus::Refunded])->isEmpty(),
            'total_amount' => (float) $order->total,
            'shipping_address' => $order->shipping_address,
            'subtotal' => Money::format($order->subtotal),
            'shipping_fee' => (float) $order->shipping_fee === 0.0 ? 'Free' : Money::format($order->shipping_fee),
            'total' => Money::format($order->total),
            'items' => $order->items->map(fn ($item) => [
                'title' => $item->title,
                'quantity' => $item->quantity,
                'line_total' => Money::format($item->line_total),
                'fulfilment' => $item->fulfilment_status?->label() ?? 'Pending',
                'tracking_number' => $item->tracking_number,
                'carrier' => $item->carrier,
            ]),
            'returns' => $order->returns->map(fn (OrderReturn $return) => [
                'reason' => $return->reason,
                'status' => $return->status->label(),
                'amount' => Money::format($return->refund_amount),
            ]),
        ];
    }
}
