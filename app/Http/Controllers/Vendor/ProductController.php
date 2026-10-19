<?php

namespace App\Http\Controllers\Vendor;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $vendor = $this->shop();

        $products = $vendor->products()
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'formatted_price' => $product->formattedPrice(),
                'stock' => $product->stock,
                'status_label' => $product->status->label(),
            ]);

        return Inertia::render('Vendor/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create(): Response
    {
        $this->shop();

        return Inertia::render('Vendor/Products/Form', [
            'product' => [
                'id' => null,
                'category_id' => null,
                'title' => '',
                'description' => '',
                'price' => '',
                'compare_at_price' => '',
                'stock' => 0,
                'sku' => '',
                'status' => ProductStatus::Active->value,
                'image_url' => '',
            ],
            'categories' => $this->categories(),
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $vendor = $this->shop();
        [$data, $imageUrl] = $this->validated($request);
        $data['vendor_id'] = $vendor->id;
        $data['slug'] = $this->uniqueSlug($data['title']);

        $product = Product::query()->create($data);
        $this->syncImage($product, $imageUrl);

        return redirect()->route('vendor.products.index')->with('status', 'Product added.');
    }

    public function edit(Product $product): Response
    {
        $product = $this->owned($product);
        $product->load('primaryImage');

        return Inertia::render('Vendor/Products/Form', [
            'product' => [
                'id' => $product->id,
                'category_id' => $product->category_id,
                'title' => $product->title,
                'description' => $product->description,
                'price' => $product->price,
                'compare_at_price' => $product->compare_at_price,
                'stock' => $product->stock,
                'sku' => $product->sku,
                'status' => $product->status->value,
                'image_url' => $product->primaryImage?->path,
            ],
            'categories' => $this->categories(),
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product = $this->owned($product);
        [$data, $imageUrl] = $this->validated($request, $product);

        if ($product->title !== $data['title']) {
            $data['slug'] = $this->uniqueSlug($data['title'], $product->id);
        }

        $product->update($data);
        $this->syncImage($product, $imageUrl);

        return redirect()->route('vendor.products.index')->with('status', 'Product updated.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->owned($product)->delete();

        return redirect()->route('vendor.products.index')->with('status', 'Product deleted.');
    }

    private function shop(): Vendor
    {
        $vendor = auth()->user()?->vendor;
        abort_if($vendor === null, 403);

        return $vendor;
    }

    private function owned(Product $product): Product
    {
        abort_unless($product->vendor_id === $this->shop()->id, 404);

        return $product;
    }

    /**
     * @return array{0: array<string, mixed>, 1: ?string}
     */
    private function validated(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product?->id)],
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'image_url' => ['nullable', 'url', 'max:500'],
        ]);

        $imageUrl = $data['image_url'] ?? null;
        unset($data['image_url']);

        if (($data['compare_at_price'] ?? '') === '') {
            $data['compare_at_price'] = null;
        }

        return [$data, $imageUrl];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return collect(ProductStatus::cases())->map(fn (ProductStatus $status) => [
            'value' => $status->value,
            'label' => $status->label(),
        ])->all();
    }

    /**
     * @return Collection<int, Category>
     */
    private function categories()
    {
        return Category::query()->whereNotNull('parent_id')->orderBy('name')->get(['id', 'name']);
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'product';
        $slug = $base;
        $i = 1;

        while (Product::query()->where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
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
            $image->update(['path' => $url]);

            return;
        }

        ProductImage::query()->create([
            'product_id' => $product->id,
            'path' => $url,
            'is_primary' => true,
            'sort_order' => 0,
        ]);
    }
}
