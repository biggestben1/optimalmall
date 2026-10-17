<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->string('search');
        $categoryId = $request->integer('category') ?: null;
        $sort = (string) $request->string('sort', 'newest');
        $minPrice = $request->input('min');
        $maxPrice = $request->input('max');

        $categories = Category::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with(['children' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'children' => $c->children->map(fn ($ch) => ['id' => $ch->id, 'name' => $ch->name]),
            ]);

        $products = Product::query()
            ->active()
            ->with(['primaryImage', 'vendor', 'images', 'category'])
            ->when($search !== '', function ($query) use ($search) {
                $term = '%'.$search.'%';
                $query->where(function ($inner) use ($term) {
                    $inner->where('title', 'like', $term)
                        ->orWhere('description', 'like', $term)
                        ->orWhere('sku', 'like', $term)
                        ->orWhereHas('vendor', fn ($vendorQuery) => $vendorQuery->where('name', 'like', $term))
                        ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', $term));
                });
            })
            ->when($categoryId, function ($query) use ($categoryId) {
                $categoryIds = Category::query()
                    ->where('id', $categoryId)
                    ->orWhere('parent_id', $categoryId)
                    ->pluck('id');
                $query->whereIn('category_id', $categoryIds);
            })
            ->when(filled($minPrice), fn ($q) => $q->where('price', '>=', (float) $minPrice))
            ->when(filled($maxPrice), fn ($q) => $q->where('price', '<=', (float) $maxPrice))
            ->when($sort === 'price_asc', fn ($q) => $q->orderBy('price'))
            ->when($sort === 'price_desc', fn ($q) => $q->orderByDesc('price'))
            ->when($sort === 'featured', fn ($q) => $q->orderByDesc('is_featured')->latest())
            ->when($sort === 'newest' || $sort === '', fn ($q) => $q->latest())
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'compare_at_price' => $product->compare_at_price !== null ? (float) $product->compare_at_price : null,
                'formatted_price' => $product->formattedPrice(),
                'is_featured' => $product->is_featured,
                'image_url' => $product->primaryImage?->url() ?? $product->images->first()?->url(),
                'vendor' => $product->vendor ? ['name' => $product->vendor->name] : null,
            ]);

        return Inertia::render('Storefront/Products', [
            'categories' => $categories,
            'products' => $products,
            'filters' => [
                'search' => $search,
                'category' => $categoryId,
                'sort' => $sort ?: 'newest',
                'min' => $minPrice,
                'max' => $maxPrice,
            ],
        ]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->status->value === 'active', 404);

        $product->load(['images', 'vendor', 'category.parent']);

        $related = Product::query()
            ->active()
            ->with(['primaryImage', 'vendor', 'images'])
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->latest()
            ->take(4)
            ->get()
            ->map(fn (Product $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'slug' => $item->slug,
                'formatted_price' => $item->formattedPrice(),
                'compare_at_price' => $item->compare_at_price !== null ? (float) $item->compare_at_price : null,
                'is_featured' => $item->is_featured,
                'image_url' => $item->primaryImage?->url() ?? $item->images->first()?->url(),
                'vendor' => $item->vendor ? ['name' => $item->vendor->name] : null,
            ]);

        return Inertia::render('Storefront/ProductShow', [
            'product' => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (float) $product->price,
                'compare_at_price' => $product->compare_at_price !== null ? (float) $product->compare_at_price : null,
                'formatted_price' => $product->formattedPrice(),
                'stock' => $product->stock,
                'in_stock' => $product->inStock(),
                'image_url' => $product->primaryImage?->url() ?? $product->images->first()?->url(),
                'category' => $product->category ? ['id' => $product->category->id, 'name' => $product->category->name] : null,
                'vendor' => $product->vendor ? [
                    'name' => $product->vendor->name,
                    'city' => $product->vendor->city,
                    'state' => $product->vendor->state,
                ] : null,
            ],
            'related' => $related,
        ]);
    }
}
