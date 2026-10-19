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
use App\Support\Money;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(): Response
    {
        $revenue = (float) Payment::query()->where('status', PaymentStatus::Successful)->sum('amount');
        $pendingSettlements = (float) Settlement::query()->where('status', SettlementStatus::Pending)->sum('amount');

        $recentOrders = Order::query()
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
            ->groupBy('title')
            ->orderByDesc('units')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'title' => $row->title,
                'units' => (int) $row->units,
                'revenue' => Money::format($row->revenue),
            ]);

        return Inertia::render('Admin/Reports/Index', [
            'stats' => [
                ['label' => 'Orders', 'value' => (string) Order::query()->count()],
                ['label' => 'Revenue collected', 'value' => Money::format($revenue)],
                ['label' => 'Open orders', 'value' => (string) Order::query()->whereNotIn('status', [OrderStatus::Delivered, OrderStatus::Cancelled])->count()],
                ['label' => 'Pending settlements', 'value' => Money::format($pendingSettlements)],
                ['label' => 'Return requests', 'value' => (string) OrderReturn::query()->where('status', ReturnStatus::Requested)->count()],
                ['label' => 'Reviews awaiting approval', 'value' => (string) Review::query()->where('status', ReviewStatus::Pending)->count()],
            ],
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
        ]);
    }
}
