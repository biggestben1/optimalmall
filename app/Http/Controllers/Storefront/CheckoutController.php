<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Storefront\Checkout;
use App\Support\Cart;
use App\Support\Money;
use App\Support\Offer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function create(Request $request, Cart $cart, Checkout $checkout): Response|RedirectResponse
    {
        $lines = $cart->lines();

        if ($lines === []) {
            return redirect()->route('cart.index');
        }

        $quote = $checkout->quote($lines);
        $user = $request->user();

        return Inertia::render('Storefront/Checkout', [
            'lines' => $lines,
            'quote' => $quote,
            'wallet' => $checkout->walletOption($user, $quote['total']),
            'customer' => [
                'name' => $user?->name ?? '',
                'email' => $user?->email ?? '',
            ],
        ]);
    }

    public function store(Request $request, Checkout $checkout): RedirectResponse
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:255'],
            'shipping_address' => ['required', 'string', 'max:1000'],
            'payment_method' => ['required', 'in:delivery,wallet'],
        ]);

        $order = $checkout->place($data, $request->user());
        $placed = session('placed_orders', []);
        $placed[] = $order->id;
        session(['placed_orders' => $placed]);

        return redirect()->route('checkout.show', $order->number)->with('status', 'Order '.$order->number.' is placed.');
    }

    public function applyCoupon(Request $request, Offer $offer): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:40'],
        ]);

        $offer->remember($data['code']);

        return back()->with('status', 'Coupon applied.');
    }

    public function removeCoupon(Offer $offer): RedirectResponse
    {
        $offer->forget();

        return back()->with('status', 'Coupon removed.');
    }

    public function show(Request $request, Order $order): Response
    {
        $ownsOrder = $request->user() !== null && $order->user_id === $request->user()->id;
        $placedHere = in_array($order->id, session('placed_orders', []), true);
        abort_unless($ownsOrder || $placedHere, 403);

        $order->load('items');

        return Inertia::render('Storefront/OrderPlaced', [
            'order' => [
                'number' => $order->number,
                'status' => $order->status->label(),
                'paid' => $order->status->value === 'paid',
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'shipping_address' => $order->shipping_address,
                'subtotal' => Money::format($order->subtotal),
                'shipping_fee' => (float) $order->shipping_fee === 0.0 ? 'Free' : Money::format($order->shipping_fee),
                'total' => Money::format($order->total),
                'items' => $order->items->map(fn ($item) => [
                    'title' => $item->title,
                    'quantity' => $item->quantity,
                    'line_total' => Money::format($item->line_total),
                    'fulfilment' => $item->fulfilment_status?->label(),
                    'tracking_number' => $item->tracking_number,
                    'carrier' => $item->carrier,
                ]),
            ],
        ]);
    }
}
