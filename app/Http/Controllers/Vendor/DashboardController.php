<?php

namespace App\Http\Controllers\Vendor;

use App\Enums\SettlementStatus;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Settlement;
use App\Support\Money;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $vendor = auth()->user()?->vendor;

        if ($vendor === null) {
            return Inertia::render('Vendor/Dashboard', [
                'shop' => null,
                'stats' => [],
                'products' => [],
                'orders' => [],
                'settlements' => [],
            ]);
        }

        $products = $vendor->products()->latest()->limit(8)->get();
        $orders = OrderItem::query()
            ->with('order')
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->limit(8)
            ->get();
        $settlements = Settlement::query()
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Vendor/Dashboard', [
            'shop' => [
                'name' => $vendor->name,
                'email' => $vendor->email,
                'status' => $vendor->status->label(),
                'city' => $vendor->city,
                'state' => $vendor->state,
            ],
            'stats' => [
                ['label' => 'Products', 'value' => (string) $vendor->products()->count()],
                ['label' => 'Units sold', 'value' => (string) OrderItem::query()->where('vendor_id', $vendor->id)->sum('quantity')],
                ['label' => 'Pending settlement', 'value' => Money::format(
                    Settlement::query()->where('vendor_id', $vendor->id)->where('status', SettlementStatus::Pending)->sum('amount')
                )],
            ],
            'products' => $products->map(fn ($product) => [
                'id' => $product->id,
                'title' => $product->title,
                'stock' => $product->stock,
                'price' => $product->formattedPrice(),
            ])->values(),
            'orders' => $orders->map(fn (OrderItem $item) => [
                'id' => $item->id,
                'order_number' => $item->order?->number,
                'title' => $item->title,
                'quantity' => $item->quantity,
                'total' => Money::format($item->line_total),
            ])->values(),
            'settlements' => $settlements->map(fn (Settlement $settlement) => [
                'id' => $settlement->id,
                'reference' => $settlement->reference,
                'amount' => Money::format($settlement->amount),
                'status' => $settlement->status->label(),
            ])->values(),
        ]);
    }
}
