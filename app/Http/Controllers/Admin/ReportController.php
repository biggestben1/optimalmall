<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReturnStatus;
use App\Enums\ReviewStatus;
use App\Enums\SettlementStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Settlement;
use App\Models\User;
use App\Models\Vendor;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $from = $request->date('from') ?? now()->startOfMonth();
        $to = $request->date('to') ?? now();
        $start = $from->copy()->startOfDay();
        $end = $to->copy()->endOfDay();

        $orders = Order::query()->whereBetween('placed_at', [$start, $end]);
        $revenue = (float) Payment::query()
            ->where('status', PaymentStatus::Successful)
            ->whereBetween(DB::raw('coalesce(paid_at, created_at)'), [$start, $end])
            ->sum('amount');
        $pendingSettlements = (float) Settlement::query()->where('status', SettlementStatus::Pending)->sum('amount');

        $recentOrders = (clone $orders)
            ->latest('placed_at')
            ->limit(8)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'customer_name' => $order->customer_name,
                'status' => $order->status->label(),
                'total' => Money::format($order->total),
            ]);

        $topProducts = OrderItem::query()
            ->selectRaw('title, sum(quantity) as units, sum(line_total) as revenue')
            ->whereHas('order', fn ($query) => $query->whereBetween('placed_at', [$start, $end]))
            ->groupBy('title')
            ->orderByDesc('units')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'title' => $row->title,
                'units' => (int) $row->units,
                'revenue' => Money::format($row->revenue),
            ]);

        $vendorRows = OrderItem::query()
            ->selectRaw('vendor_id, sum(line_total) as revenue, sum(quantity) as units')
            ->whereNotNull('vendor_id')
            ->whereHas('order', fn ($query) => $query->whereBetween('placed_at', [$start, $end]))
            ->groupBy('vendor_id')
            ->orderByDesc('revenue')
            ->limit(8)
            ->get();
        $vendorNames = Vendor::query()->whereIn('id', $vendorRows->pluck('vendor_id'))->pluck('name', 'id');
        $vendors = $vendorRows->map(fn ($row) => [
            'name' => $vendorNames[$row->vendor_id] ?? 'Unknown seller',
            'units' => (int) $row->units,
            'revenue' => Money::format($row->revenue),
        ]);

        $customers = Order::query()
            ->selectRaw('customer_name, customer_email, count(*) as orders_count, sum(total) as spent')
            ->whereBetween('placed_at', [$start, $end])
            ->groupBy('customer_name', 'customer_email')
            ->orderByDesc('spent')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->customer_name,
                'email' => $row->customer_email,
                'orders' => (int) $row->orders_count,
                'spent' => Money::format($row->spent),
            ]);

        return Inertia::render('Admin/Reports/Index', [
            'filters' => [
                'from' => $start->toDateString(),
                'to' => $end->toDateString(),
            ],
            'stats' => [
                ['label' => 'Orders', 'value' => (string) (clone $orders)->count()],
                ['label' => 'Revenue collected', 'value' => Money::format($revenue)],
                ['label' => 'Open orders', 'value' => (string) (clone $orders)->whereNotIn('status', [OrderStatus::Delivered, OrderStatus::Cancelled])->count()],
                ['label' => 'Pending settlements', 'value' => Money::format($pendingSettlements)],
                ['label' => 'Return requests', 'value' => (string) OrderReturn::query()->where('status', ReturnStatus::Requested)->whereBetween('created_at', [$start, $end])->count()],
                ['label' => 'Reviews awaiting approval', 'value' => (string) Review::query()->where('status', ReviewStatus::Pending)->count()],
                ['label' => 'Customers in range', 'value' => (string) User::query()->where('role', 'customer')->whereBetween('created_at', [$start, $end])->count()],
            ],
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'vendors' => $vendors,
            'customers' => $customers,
        ]);
    }
}
