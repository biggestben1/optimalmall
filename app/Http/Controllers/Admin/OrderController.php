<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Vendor\AuditLogger;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $orders = Order::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('placed_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('placed_at', '<=', $request->date('to')))
            ->latest('placed_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Order $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'customer_name' => $order->customer_name,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'total' => Money::format($order->total),
                'placed_at' => $order->placed_at->format('d M Y'),
            ]);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $search,
                'status' => $request->string('status')->toString(),
                'from' => $request->string('from')->toString(),
                'to' => $request->string('to')->toString(),
            ],
            'statuses' => collect(OrderStatus::cases())->map(fn (OrderStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load('items');

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'number' => $order->number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'status' => $order->status->value,
                'subtotal' => Money::format($order->subtotal),
                'shipping_fee' => Money::format($order->shipping_fee),
                'total' => Money::format($order->total),
                'placed_at' => $order->placed_at->format('d M Y H:i'),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'quantity' => $item->quantity,
                    'unit_price' => Money::format($item->unit_price),
                    'line_total' => Money::format($item->line_total),
                ]),
            ],
            'statuses' => collect(OrderStatus::cases())->map(fn (OrderStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $order->update(['status' => $data['status']]);
        AuditLogger::record('order.updated', $order, ['status' => $data['status']]);

        return redirect()->route('admin.orders.show', $order)->with('status', 'Order updated.');
    }
}
