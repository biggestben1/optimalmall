<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Vendor/Orders/Index', [
            'orders' => Portal::current()->orders(
                $request->string('q')->toString(),
                $request->string('status')->toString(),
            ),
            'filters' => $request->only(['q', 'status']),
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('Vendor/Orders/Show', [
            'order' => Portal::current()->orderDetail($order),
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        Portal::current()->updateFulfilment($order, $request->all());

        return redirect()->route('vendor.orders.show', $order)->with('status', 'Fulfilment updated.');
    }
}
