<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\Wishlist;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Wishlist $wishlist): Response
    {
        return Inertia::render('Storefront/Wishlist', [
            'lines' => $wishlist->lines(),
        ]);
    }

    public function toggle(Product $product, Wishlist $wishlist): RedirectResponse
    {
        $saved = $wishlist->toggle($product);

        return back()->with('status', $saved ? $product->title.' was saved.' : $product->title.' was removed from your wishlist.');
    }
}
