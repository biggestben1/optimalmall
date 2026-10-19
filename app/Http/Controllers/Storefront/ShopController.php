<?php

namespace App\Http\Controllers\Storefront;

use App\Enums\ProductStatus;
use App\Enums\VendorStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(): Response
    {
        $shops = Vendor::query()
            ->where('status', VendorStatus::Active)
            ->withCount(['products' => fn ($query) => $query->where('status', ProductStatus::Active)])
            ->orderBy('name')
            ->get()
            ->map(fn (Vendor $vendor) => [
                'name' => $vendor->name,
                'slug' => $vendor->slug,
                'city' => $vendor->city,
                'state' => $vendor->state,
                'description' => $vendor->description,
                'logo_url' => is_string($vendor->logo_path) && str_starts_with($vendor->logo_path, 'http') ? $vendor->logo_path : null,
                'products' => $vendor->products_count,
            ]);

        return Inertia::render('Storefront/Shops', ['shops' => $shops]);
    }

    public function show(Vendor $vendor): Response
    {
        abort_unless($vendor->status === VendorStatus::Active, 404);

        $products = Product::query()
            ->active()
            ->with(['primaryImage', 'images', 'vendor'])
            ->where('vendor_id', $vendor->id)
            ->latest()
            ->paginate(12)
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'formatted_price' => $product->formattedPrice(),
                'compare_at_price' => $product->compare_at_price !== null ? (float) $product->compare_at_price : null,
                'is_featured' => $product->is_featured,
                'image_url' => $product->primaryImage?->url() ?? $product->images->first()?->url(),
                'vendor' => ['name' => $vendor->name],
            ]);

        return Inertia::render('Storefront/Shop', [
            'shop' => [
                'name' => $vendor->name,
                'description' => $vendor->description,
                'city' => $vendor->city,
                'state' => $vendor->state,
            ],
            'products' => $products,
        ]);
    }
}
