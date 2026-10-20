<?php

use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('forbids customers from the admin dashboard', function () {
    $customer = User::factory()->create(['role' => UserRole::Customer]);

    $this->actingAs($customer)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

it('allows super admins to view the admin dashboard', function () {
    $admin = User::factory()->superAdmin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('stats.products')
            ->has('stats.customers')
        );
});

it('allows super admins to browse admin catalogue modules', function () {
    $admin = User::factory()->superAdmin()->create();

    $this->actingAs($admin)->get(route('admin.products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Products/Index'));

    $this->actingAs($admin)->get(route('admin.categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Categories/Index'));

    $this->actingAs($admin)->get(route('admin.vendors.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Vendors/Index'));

    $this->actingAs($admin)->get(route('admin.customers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Customers/Index'));

    $this->actingAs($admin)->get(route('admin.banners.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Banners/Index'));

    $this->actingAs($admin)->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Orders/Index'));

    $this->actingAs($admin)->get(route('admin.payments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Payments/Index'));

    $this->actingAs($admin)->get(route('admin.coupons.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Coupons/Index'));

    $this->actingAs($admin)->get(route('admin.advertisements.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Advertising/Index'));

    $this->actingAs($admin)->get(route('admin.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Reviews/Index'));

    $this->actingAs($admin)->get(route('admin.returns.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Returns/Index'));

    $this->actingAs($admin)->get(route('admin.reports'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Reports/Index'));

    $this->actingAs($admin)->get(route('admin.roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Admin/Roles/Index'));
});

it('allows super admins to create a product', function () {
    $admin = User::factory()->superAdmin()->create();
    $vendor = Vendor::factory()->create();
    $category = Category::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'vendor_id' => $vendor->id,
            'category_id' => $category->id,
            'title' => 'Admin Created Speaker',
            'description' => 'A test product',
            'price' => 45000,
            'compare_at_price' => 50000,
            'stock' => 12,
            'sku' => 'OM-TEST-9999',
            'status' => ProductStatus::Active->value,
            'image_url' => 'https://picsum.photos/seed/admincreate/640/640',
            'is_featured' => '1',
        ])
        ->assertRedirect(route('admin.products.index'));

    expect(Product::query()->where('title', 'Admin Created Speaker')->exists())->toBeTrue();
});

it('stores an uploaded image when an admin creates a product', function () {
    Storage::fake('public');
    $admin = User::factory()->superAdmin()->create();
    $vendor = Vendor::factory()->create();
    $category = Category::factory()->create();
    $jpeg = base64_decode('/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIVFhUVFRUYFxgYGBcYGBgYGBgYGBgYGBgYHiggGBolHRgYITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAIEBQYHB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Aqqp/9k=');

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'vendor_id' => $vendor->id,
            'category_id' => $category->id,
            'title' => 'Uploaded Speaker',
            'price' => 12000,
            'stock' => 3,
            'status' => ProductStatus::Active->value,
            'image' => UploadedFile::fake()->createWithContent('speaker.jpg', $jpeg),
        ])
        ->assertRedirect(route('admin.products.index'));

    $product = Product::query()->where('title', 'Uploaded Speaker')->first();

    expect($product?->primaryImage)->not->toBeNull()
        ->and($product->primaryImage->path)->toStartWith('products/');
    Storage::disk('public')->assertExists($product->primaryImage->path);
});
