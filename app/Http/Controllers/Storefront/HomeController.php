<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $productMap = fn (Product $product) => [
            'id' => $product->id,
            'title' => $product->title,
            'slug' => $product->slug,
            'price' => (float) $product->price,
            'compare_at_price' => $product->compare_at_price !== null ? (float) $product->compare_at_price : null,
            'formatted_price' => $product->formattedPrice(),
            'is_featured' => $product->is_featured,
            'image_url' => $product->primaryImage?->url() ?? $product->images->first()?->url(),
            'vendor' => $product->vendor ? ['name' => $product->vendor->name] : null,
        ];

        return Inertia::render('Storefront/Home', [
            'categories' => Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->with(['children' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
                ->orderBy('sort_order')
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'icon' => $c->icon,
                    'children' => $c->children->map(fn ($ch) => ['id' => $ch->id, 'name' => $ch->name]),
                ]),
            'banners' => Banner::query()->active()->get()->map(fn ($b) => [
                'id' => $b->id,
                'title' => $b->title,
                'subtitle' => $b->subtitle,
                'image_url' => $b->imageUrl(),
                'link_url' => $b->link_url,
                'cta_label' => $b->cta_label,
            ]),
            'featured' => Product::query()->active()->with(['primaryImage', 'vendor', 'images'])->where('is_featured', true)->latest()->take(8)->get()->map($productMap),
            'trending' => Product::query()->active()->with(['primaryImage', 'vendor', 'images'])->where('is_trending', true)->latest()->take(8)->get()->map($productMap),
            'bestSellers' => Product::query()->active()->with(['primaryImage', 'vendor', 'images'])->where('is_best_seller', true)->latest()->take(8)->get()->map($productMap),
        ]);
    }
}
