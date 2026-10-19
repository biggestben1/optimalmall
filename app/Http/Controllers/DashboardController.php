<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $orders = $user->isCustomer()
            ? Order::query()->where('user_id', $user->id)->latest('placed_at')->take(5)->get()->map(fn (Order $order) => [
                'number' => $order->number,
                'status' => $order->status->label(),
                'total' => Money::format($order->total),
                'placed_at' => $order->placed_at?->format('d M Y'),
            ])->all()
            : [];

        return Inertia::render('Dashboard', [
            'orders' => $orders,
            'order_count' => $user->isCustomer()
                ? Order::query()->where('user_id', $user->id)->count()
                : 0,
        ]);
    }
}
