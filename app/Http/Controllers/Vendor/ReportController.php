<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Support\Money;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(): Response
    {
        $vendor = auth()->user()?->vendor;
        abort_if($vendor === null, 403);

        $items = OrderItem::query()->where('vendor_id', $vendor->id);
        $revenue = (float) (clone $items)->sum('line_total');
        $units = (int) (clone $items)->sum('quantity');
        $orders = (int) (clone $items)->distinct('order_id')->count('order_id');

        $byProduct = OrderItem::query()
            ->where('vendor_id', $vendor->id)
            ->selectRaw('title, sum(quantity) as units, sum(line_total) as revenue')
            ->groupBy('title')
            ->orderByDesc('revenue')
            ->get()
            ->map(fn ($row) => [
                'title' => $row->title,
                'units' => (int) $row->units,
                'revenue' => Money::format($row->revenue),
            ]);

        $recent = OrderItem::query()
            ->with('order')
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn (OrderItem $item) => [
                'id' => $item->id,
                'order_number' => $item->order?->number,
                'title' => $item->title,
                'quantity' => $item->quantity,
                'total' => Money::format($item->line_total),
                'placed_at' => $item->order?->placed_at?->format('d M Y') ?? $item->created_at->format('d M Y'),
            ]);

        return Inertia::render('Vendor/Reports/Index', [
            'shopName' => $vendor->name,
            'stats' => [
                ['label' => 'Sales revenue', 'value' => Money::format($revenue)],
                ['label' => 'Units sold', 'value' => (string) $units],
                ['label' => 'Orders', 'value' => (string) $orders],
            ],
            'byProduct' => $byProduct,
            'recent' => $recent,
        ]);
    }
}
