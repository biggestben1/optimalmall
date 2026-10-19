<?php

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the homepage with seeded catalogue sections', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Home')
            ->has('categories')
            ->has('featured')
        );
});

it('lists products in the catalogue', function () {
    $vendor = Vendor::factory()->create();
    $category = Category::factory()->create();
    $product = Product::factory()->create([
        'vendor_id' => $vendor->id,
        'category_id' => $category->id,
        'title' => 'Unique OptimalMall Phone X',
        'status' => ProductStatus::Active,
    ]);
    ProductImage::factory()->create(['product_id' => $product->id]);

    $this->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Products')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Unique OptimalMall Phone X')
        );
});

it('filters catalogue results by search and category', function () {
    $vendor = Vendor::factory()->create(['name' => 'Lagos Gadget Hub']);
    $phones = Category::factory()->create(['name' => 'Phones & Tablets']);
    $fashion = Category::factory()->create(['name' => 'Fashion & Beauty']);

    $match = Product::factory()->create([
        'vendor_id' => $vendor->id,
        'category_id' => $phones->id,
        'title' => 'Samsung Galaxy SearchMatch',
        'status' => ProductStatus::Active,
    ]);
    Product::factory()->create([
        'vendor_id' => $vendor->id,
        'category_id' => $fashion->id,
        'title' => 'Ankara Midi Dress',
        'status' => ProductStatus::Active,
    ]);
    ProductImage::factory()->create(['product_id' => $match->id]);

    $this->get(route('products.index', [
        'search' => 'Samsung',
        'category' => $phones->id,
    ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Products')
            ->has('products.data', 1)
            ->where('products.data.0.title', 'Samsung Galaxy SearchMatch')
            ->where('filters.search', 'Samsung')
            ->where('filters.category', $phones->id)
        );
});

it('shows an active product detail page', function () {
    $product = Product::factory()->create([
        'title' => 'Detail Page Gadget',
        'status' => ProductStatus::Active,
    ]);
    ProductImage::factory()->create(['product_id' => $product->id]);

    $this->get(route('products.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/ProductShow')
            ->where('product.title', 'Detail Page Gadget')
        );
});

it('adds an in-stock product to the cart and keeps a second add within stock', function () {
    $product = Product::factory()->create([
        'title' => 'Cart Phone',
        'status' => ProductStatus::Active,
        'price' => 1500,
        'stock' => 3,
    ]);

    $this->post(route('cart.store', $product), ['quantity' => 2])
        ->assertRedirect()
        ->assertSessionHas('status');

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Cart')
            ->where('summary.count', 2)
            ->where('lines.0.title', 'Cart Phone')
            ->where('lines.0.quantity', 2)
        );

    $this->post(route('cart.store', $product), ['quantity' => 2])
        ->assertSessionHasErrors('quantity');

    $this->patch(route('cart.update', $product), ['quantity' => 1])->assertRedirect();
    $this->delete(route('cart.destroy', $product))->assertRedirect();

    $this->get(route('cart.index'))
        ->assertInertia(fn (Assert $page) => $page->where('summary.count', 0)->where('lines', []));
});

it('refuses to add a draft or sold-out product', function () {
    $draft = Product::factory()->draft()->create();
    $soldOut = Product::factory()->create([
        'status' => ProductStatus::Active,
        'stock' => 0,
    ]);

    $this->post(route('cart.store', $draft), ['quantity' => 1])->assertNotFound();
    $this->post(route('cart.store', $soldOut), ['quantity' => 1])->assertSessionHasErrors('quantity');
});

it('hides draft products from the storefront', function () {
    $product = Product::factory()->draft()->create([
        'title' => 'Hidden Draft Product',
    ]);

    $this->get(route('products.show', $product))->assertNotFound();
});
