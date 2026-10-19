<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = Review::query()
            ->with('product')
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Review $review) => [
                'id' => $review->id,
                'product' => $review->product?->title,
                'author_name' => $review->author_name,
                'rating' => $review->rating,
                'body' => $review->body,
                'status' => $review->status->value,
                'status_label' => $review->status->label(),
            ]);

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'statuses' => collect(ReviewStatus::cases())->map(fn (ReviewStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
        ]);
    }

    public function update(Request $request, Review $review): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(ReviewStatus::class)],
        ]);

        $review->update(['status' => $data['status']]);

        return redirect()->route('admin.reviews.index')->with('status', 'Review updated.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return redirect()->route('admin.reviews.index')->with('status', 'Review deleted.');
    }
}
