<?php

namespace App\Http\Controllers\Storefront;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->status->value === 'active', 404);
        $user = $request->user();
        abort_unless($user !== null, 403);

        $bought = OrderItem::query()
            ->where('product_id', $product->id)
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))
            ->exists();

        abort_unless($bought, 403);

        if (Review::query()->where('product_id', $product->id)->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'You already reviewed this product.');
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['required', 'string', 'max:1000'],
        ]);

        Review::query()->create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'author_name' => $user->name,
            'rating' => $data['rating'],
            'body' => $data['body'],
            'status' => ReviewStatus::Pending,
        ]);

        return back()->with('status', 'Thanks. Your review will appear after it is checked.');
    }
}
