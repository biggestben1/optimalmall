<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Storefront/Track');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'number' => ['required', 'string', 'max:40'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        $order = Order::query()
            ->where('number', $data['number'])
            ->whereRaw('lower(customer_email) = ?', [strtolower($data['email'])])
            ->first();

        if ($order === null) {
            return back()->withErrors(['number' => 'No order matches that number and email.']);
        }

        $placed = session('placed_orders', []);
        $placed[] = $order->id;
        session(['placed_orders' => $placed]);

        return redirect()->route('checkout.show', $order->number);
    }
}
