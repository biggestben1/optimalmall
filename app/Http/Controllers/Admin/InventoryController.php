<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FulfilmentStatus;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use App\Services\Vendor\AuditLogger;
use App\Support\MarketplaceSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $threshold = (int) MarketplaceSettings::get('low_stock_threshold', 5);

        $products = Product::query()
            ->with(['vendor:id,name', 'category:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('category', fn ($category) => $category->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->boolean('low'), fn ($query) => $query->where('stock', '<=', $threshold))
            ->orderBy('stock')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'sku' => $product->sku,
                'vendor' => $product->vendor?->name,
                'stock' => $product->stock,
                'low' => $product->stock <= $threshold,
            ]);

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'filters' => ['search' => $search, 'low' => $request->boolean('low')],
            'threshold' => $threshold,
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        $from = $product->stock;
        $product->update(['stock' => $data['stock']]);
        AuditLogger::record('inventory.adjusted', $product, [
            'from' => $from,
            'to' => (int) $data['stock'],
        ], $product->vendor);

        return back()->with('status', 'Stock updated.');
    }

    public function shipping(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $items = OrderItem::query()
            ->with(['order:id,number,customer_name,shipping_address', 'vendor:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('tracking_number', 'like', "%{$search}%")
                        ->orWhereHas('order', fn ($order) => $order->where('number', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (OrderItem $item) => [
                'id' => $item->id,
                'order_number' => $item->order?->number,
                'customer' => $item->order?->customer_name,
                'title' => $item->title,
                'vendor' => $item->vendor?->name,
                'status' => $item->fulfilment_status?->value ?? FulfilmentStatus::Pending->value,
                'carrier' => $item->carrier,
                'tracking_number' => $item->tracking_number,
            ]);

        return Inertia::render('Admin/Inventory/Shipping', [
            'items' => $items,
            'filters' => ['search' => $search],
            'statuses' => collect(FulfilmentStatus::cases())->map(fn (FulfilmentStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
        ]);
    }

    public function updateShipping(Request $request, OrderItem $orderItem): RedirectResponse
    {
        $data = $request->validate([
            'fulfilment_status' => ['required', Rule::enum(FulfilmentStatus::class)],
            'carrier' => ['nullable', 'string', 'max:120'],
            'tracking_number' => ['nullable', 'string', 'max:120'],
        ]);

        $status = FulfilmentStatus::from($data['fulfilment_status']);
        $orderItem->update([
            'fulfilment_status' => $status,
            'carrier' => $data['carrier'] ?? null,
            'tracking_number' => $data['tracking_number'] ?? null,
            'shipped_at' => $status === FulfilmentStatus::Shipped ? ($orderItem->shipped_at ?? now()) : $orderItem->shipped_at,
            'delivered_at' => $status === FulfilmentStatus::Delivered ? ($orderItem->delivered_at ?? now()) : $orderItem->delivered_at,
        ]);
        AuditLogger::record('shipping.updated', $orderItem, [
            'status' => $status->value,
            'tracking_number' => $orderItem->tracking_number,
        ], $orderItem->vendor);

        return back()->with('status', 'Shipment updated.');
    }
}
