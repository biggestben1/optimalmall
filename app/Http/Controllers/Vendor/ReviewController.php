<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Vendor/Reviews/Index', [
            'reviews' => Portal::current()->reviews($request->string('q')->toString()),
            'filters' => $request->only(['q']),
        ]);
    }

    public function reply(Request $request, Review $review): RedirectResponse
    {
        Portal::current()->replyToReview($review, (string) $request->input('reply'));

        return back()->with('status', 'Reply saved.');
    }
}
