<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductApproval;
use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Vendor;
use App\Services\Vendor\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $products = Product::query()
            ->with(['vendor', 'category', 'brand', 'primaryImage'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('vendor', fn ($vendor) => $vendor->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('brand', fn ($brand) => $brand->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('category', fn ($category) => $category->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('approval'), fn ($query) => $query->where('approval_status', $request->string('approval')))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'vendor_name' => $product->vendor?->name,
                'brand_name' => $product->brand?->name,
                'formatted_price' => $product->formattedPrice(),
                'stock' => $product->stock,
                'status_label' => $product->status->label(),
                'approval' => $product->approval_status?->value,
                'approval_label' => $product->approval_status?->label() ?? 'Approved',
                'is_featured' => $product->is_featured,
            ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $search,
                'approval' => $request->string('approval')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => [
                'id' => null,
                'vendor_id' => null,
                'category_id' => null,
                'title' => '',
                'description' => '',
                'price' => '',
                'compare_at_price' => '',
                'stock' => 0,
                'sku' => '',
                'brand_id' => null,
                'status' => ProductStatus::Draft->value,
                'image_url' => '',
                'is_featured' => false,
                'is_trending' => false,
                'is_best_seller' => false,
            ],
            'vendors' => Vendor::query()->orderBy('name')->get(['id', 'name']),
            'categories' => Category::query()->whereNotNull('parent_id')->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function approval(Request $request, Product $product): RedirectResponse
    {
        $decision = $request->validate([
            'decision' => ['required', Rule::in(['approve', 'reject'])],
        ])['decision'];

        if ($decision === 'approve') {
            $product->update([
                'status' => ProductStatus::Active,
                'approval_status' => ProductApproval::Approved,
            ]);
            $product->vendor?->notifyPortal('Product approved', $product->title.' is now live on OptimalMall.');
            AuditLogger::record('product.approved', $product, [], $product->vendor, $request->user());
            $message = 'Product approved and published.';
        } else {
            $product->update([
                'status' => ProductStatus::Draft,
                'approval_status' => ProductApproval::Rejected,
            ]);
            $product->vendor?->notifyPortal('Product rejected', $product->title.' was not approved.');
            AuditLogger::record('product.rejected', $product, [], $product->vendor, $request->user());
            $message = 'Product rejected.';
        }

        return back()->with('status', $message);
    }

    public function feature(Product $product): RedirectResponse
    {
        $product->update(['is_featured' => ! $product->is_featured]);
        AuditLogger::record($product->is_featured ? 'product.featured' : 'product.unfeatured', $product, [], $product->vendor);

        return back()->with('status', $product->is_featured ? 'Product featured on the storefront.' : 'Product removed from featured.');
    }

    public function store(Request $request): RedirectResponse
    {
        [$data, $imageUrl] = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['title']);
        $product = Product::query()->create($data);
        $this->syncImage($product, $imageUrl);

        return redirect()->route('admin.products.index')->with('status', 'Product created.');
    }

    public function edit(Product $product): Response
    {
        $product->load('primaryImage');

        return Inertia::render('Admin/Products/Form', [
            'product' => [
                'id' => $product->id,
                'vendor_id' => $product->vendor_id,
                'category_id' => $product->category_id,
                'brand_id' => $product->brand_id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => $product->price,
                'compare_at_price' => $product->compare_at_price,
                'stock' => $product->stock,
                'sku' => $product->sku,
                'status' => $product->status->value,
                'image_url' => str_starts_with((string) $product->primaryImage?->path, 'http') ? $product->primaryImage->path : '',
                'image_preview' => $product->primaryImage?->url(),
                'is_featured' => $product->is_featured,
                'is_trending' => $product->is_trending,
                'is_best_seller' => $product->is_best_seller,
            ],
            'vendors' => Vendor::query()->orderBy('name')->get(['id', 'name']),
            'categories' => Category::query()->whereNotNull('parent_id')->orderBy('name')->get(['id', 'name']),
            'brands' => Brand::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        [$data, $imageUrl] = $this->validated($request, $product);
        if ($product->title !== $data['title']) {
            $data['slug'] = $this->uniqueSlug($data['title'], $product->id);
        }
        $product->update($data);
        $this->syncImage($product, $imageUrl);

        return redirect()->route('admin.products.index')->with('status', 'Product updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('admin.products.index')->with('status', 'Product deleted.');
    }

    /**
     * @return array{0: array<string, mixed>, 1: ?string}
     */
    private function validated(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'vendor_id' => ['required', 'exists:vendors,id'],
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product?->id)],
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
            'is_trending' => ['sometimes', 'boolean'],
            'is_best_seller' => ['sometimes', 'boolean'],
            'image_url' => ['nullable', 'url', 'max:500'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $imageUrl = $request->hasFile('image')
            ? $request->file('image')->store('products', 'public')
            : ($data['image_url'] ?? null);
        unset($data['image_url'], $data['image']);

        if (($data['compare_at_price'] ?? '') === '') {
            $data['compare_at_price'] = null;
        }

        if (($data['brand_id'] ?? '') === '') {
            $data['brand_id'] = null;
        }

        $data['is_featured'] = $request->boolean('is_featured');
        $data['is_trending'] = $request->boolean('is_trending');
        $data['is_best_seller'] = $request->boolean('is_best_seller');

        return [$data, $imageUrl];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return collect(ProductStatus::cases())
            ->map(fn (ProductStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])
            ->values()
            ->all();
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'product';
        $slug = $base;
        $i = 1;
        while (Product::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    private function syncImage(Product $product, ?string $url): void
    {
        if (! filled($url)) {
            return;
        }

        $image = $product->primaryImage()->first();
        if ($image) {
            if ($image->path !== $url && ! str_starts_with($image->path, 'http://') && ! str_starts_with($image->path, 'https://')) {
                Storage::disk('public')->delete($image->path);
            }
            $image->update(['path' => $url]);
        } else {
            ProductImage::query()->create([
                'product_id' => $product->id,
                'path' => $url,
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
