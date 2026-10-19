<?php

use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;

it('creates a vendor login from the admin form', function () {
    $admin = User::factory()->superAdmin()->create();

    $this->actingAs($admin)
        ->post(route('admin.vendors.store'), [
            'name' => 'Kano Home Store',
            'description' => 'Home goods',
            'status' => 'active',
            'city' => 'Kano',
            'state' => 'Kano',
            'phone' => '08030001111',
            'email' => 'kano@vendors.optimalmall.ng',
            'password' => 'password',
        ])
        ->assertRedirect(route('admin.vendors.index'));

    $seller = User::query()->where('email', 'kano@vendors.optimalmall.ng')->first();

    expect($seller)->not->toBeNull()
        ->and($seller->role)->toBe(UserRole::Vendor)
        ->and($seller->vendor?->name)->toBe('Kano Home Store');

    $this->post('/logout');

    $this->post('/login', [
        'email' => 'kano@vendors.optimalmall.ng',
        'password' => 'password',
    ])->assertRedirect(route('vendor.dashboard', absolute: false));
});

it('lets a vendor add a product and open the sales report', function () {
    $seller = User::factory()->create(['role' => UserRole::Vendor]);
    $vendor = Vendor::factory()->create(['user_id' => $seller->id]);
    $category = Category::factory()->create();

    $this->actingAs($seller)
        ->post(route('vendor.products.store'), [
            'category_id' => $category->id,
            'title' => 'Vendor Blender',
            'description' => 'Kitchen blender',
            'price' => 25000,
            'stock' => 6,
            'sku' => 'VEN-BLEND-1',
            'status' => ProductStatus::Active->value,
        ])
        ->assertRedirect(route('vendor.products.index'));

    expect(Product::query()->where('vendor_id', $vendor->id)->where('title', 'Vendor Blender')->exists())->toBeTrue();

    $this->actingAs($seller)
        ->get(route('vendor.reports'))
        ->assertOk();
});

it('stops a vendor from editing another shop product', function () {
    $seller = User::factory()->create(['role' => UserRole::Vendor]);
    Vendor::factory()->create(['user_id' => $seller->id]);
    $other = Product::factory()->create();

    $this->actingAs($seller)
        ->get(route('vendor.products.edit', $other))
        ->assertNotFound();
});
