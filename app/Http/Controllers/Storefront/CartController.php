<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\Cart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(Cart $cart): Response
    {
        return Inertia::render('Storefront/Cart', [
            'lines' => $cart->lines(),
            'summary' => $cart->summary(),
        ]);
    }

    public function store(Request $request, Product $product, Cart $cart): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $cart->add($product, (int) $data['quantity']);

        return back()->with('status', $product->title.' was added to your cart.');
    }

    public function update(Request $request, Product $product, Cart $cart): RedirectResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:99'],
        ]);

        $cart->update($product, (int) $data['quantity']);

        return back()->with('status', 'Cart updated.');
    }

    public function destroy(Product $product, Cart $cart): RedirectResponse
    {
        $cart->remove($product);

        return back()->with('status', $product->title.' was removed from your cart.');
    }
}
