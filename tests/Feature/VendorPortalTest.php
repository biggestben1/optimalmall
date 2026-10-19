<?php

use App\Enums\PaymentStatus;
use App\Enums\PayoutStatus;
use App\Enums\ProductApproval;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;

function vendorShop(): array
{
    $seller = User::factory()->create(['role' => UserRole::Vendor]);
    $vendor = Vendor::factory()->create(['user_id' => $seller->id, 'status' => 'active']);

    return [$seller, $vendor];
}

it('opens every seller module for the signed-in shop', function () {
    [$seller] = vendorShop();

    $routes = [
        'vendor.dashboard',
        'vendor.store.edit',
        'vendor.products.index',
        'vendor.products.create',
        'vendor.inventory.index',
        'vendor.orders.index',
        'vendor.finance.index',
        'vendor.payouts.index',
        'vendor.promotions.index',
        'vendor.reviews.index',
        'vendor.tickets.index',
        'vendor.notifications.index',
        'vendor.reports',
        'vendor.settings.edit',
    ];

    foreach ($routes as $name) {
        $this->actingAs($seller)->get(route($name))->assertOk();
    }
});

it('submits a product for admin approval instead of publishing it', function () {
    [$seller, $vendor] = vendorShop();
    $category = Category::factory()->create();

    $this->actingAs($seller)->post(route('vendor.products.store'), [
        'category_id' => $category->id,
        'title' => 'Approval Headphones',
        'price' => 15000,
        'stock' => 4,
        'status' => ProductStatus::Active->value,
    ])->assertRedirect(route('vendor.products.index'));

    $product = Product::query()->where('title', 'Approval Headphones')->first();

    expect($product->vendor_id)->toBe($vendor->id)
        ->and($product->status)->toBe(ProductStatus::Draft)
        ->and($product->approval_status)->toBe(ProductApproval::Pending);
});

it('keeps earnings on the server and ignores unverified payments', function () {
    [$seller, $vendor] = vendorShop();
    $product = Product::factory()->create(['vendor_id' => $vendor->id, 'price' => 10000]);

    $paid = Order::query()->create([
        'number' => 'OM-PAID-1',
        'customer_name' => 'Ada',
        'customer_email' => 'ada@example.com',
        'status' => 'paid',
        'subtotal' => 10000,
        'total' => 10000,
        'placed_at' => now(),
    ]);
    OrderItem::query()->create([
        'order_id' => $paid->id,
        'product_id' => $product->id,
        'vendor_id' => $vendor->id,
        'title' => $product->title,
        'quantity' => 1,
        'unit_price' => 10000,
        'line_total' => 10000,
    ]);
    Payment::query()->create([
        'order_id' => $paid->id,
        'reference' => 'PAY-PAID-1',
        'method' => 'card',
        'amount' => 10000,
        'status' => PaymentStatus::Successful,
        'paid_at' => now(),
    ]);

    $unpaid = Order::query()->create([
        'number' => 'OM-OPEN-1',
        'customer_name' => 'Bola',
        'customer_email' => 'bola@example.com',
        'status' => 'pending',
        'subtotal' => 5000,
        'total' => 5000,
        'placed_at' => now(),
    ]);
    OrderItem::query()->create([
        'order_id' => $unpaid->id,
        'vendor_id' => $vendor->id,
        'title' => 'Unpaid item',
        'quantity' => 1,
        'unit_price' => 5000,
        'line_total' => 5000,
    ]);

    $this->actingAs($seller)->get(route('vendor.finance.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.gross', 10000)
            ->where('summary.commission', 1000)
            ->where('summary.available', 9000)
            ->where('summary.unverified', 5000));

    $this->actingAs($seller)->post(route('vendor.payouts.store'), [
        'amount' => 9001,
    ])->assertSessionHasErrors('amount');

    $this->actingAs($seller)->put(route('vendor.bank.update'), [
        'bank_name' => 'Optimal Bank',
        'account_name' => 'Lagos Gadget Hub',
        'account_number' => '0123456789',
    ])->assertRedirect();

    $this->actingAs($seller)->post(route('vendor.payouts.store'), [
        'amount' => 4000,
    ])->assertRedirect(route('vendor.payouts.index'));

    expect($vendor->payouts()->first()->status)->toBe(PayoutStatus::Requested)
        ->and(AuditLog::query()->where('action', 'payout.requested')->exists())->toBeTrue();
});

it('hides another shops order and product', function () {
    [$seller] = vendorShop();
    $other = Vendor::factory()->create();
    $product = Product::factory()->create(['vendor_id' => $other->id]);
    $order = Order::query()->create([
        'number' => 'OM-OTHER-1',
        'customer_name' => 'Other',
        'customer_email' => 'other@example.com',
        'status' => 'paid',
        'subtotal' => 1000,
        'total' => 1000,
        'placed_at' => now(),
    ]);
    OrderItem::query()->create([
        'order_id' => $order->id,
        'vendor_id' => $other->id,
        'title' => 'Secret',
        'quantity' => 1,
        'unit_price' => 1000,
        'line_total' => 1000,
    ]);

    $this->actingAs($seller)->get(route('vendor.orders.show', $order))->assertNotFound();
    $this->actingAs($seller)->get(route('vendor.products.edit', $product))->assertNotFound();
    $this->actingAs($seller)->get(route('vendor.orders.index'))
        ->assertInertia(fn ($page) => $page->where('orders.data', []));
});

it('releases a payout only when verified payments cover it', function () {
    [$seller, $vendor] = vendorShop();
    $admin = User::factory()->superAdmin()->create();
    $order = Order::query()->create([
        'number' => 'OM-REL-1',
        'customer_name' => 'Ada',
        'customer_email' => 'ada@example.com',
        'status' => 'paid',
        'subtotal' => 10000,
        'total' => 10000,
        'placed_at' => now(),
    ]);
    OrderItem::query()->create([
        'order_id' => $order->id,
        'vendor_id' => $vendor->id,
        'title' => 'Phone',
        'quantity' => 1,
        'unit_price' => 10000,
        'line_total' => 10000,
    ]);
    Payment::query()->create([
        'order_id' => $order->id,
        'reference' => 'PAY-REL-1',
        'method' => 'transfer',
        'amount' => 10000,
        'status' => PaymentStatus::Successful,
        'paid_at' => now(),
    ]);

    $this->actingAs($seller)->put(route('vendor.bank.update'), [
        'bank_name' => 'Optimal Bank',
        'account_name' => 'Shop',
        'account_number' => '0123456789',
    ]);
    $this->actingAs($seller)->post(route('vendor.payouts.store'), ['amount' => 2000]);
    $payout = $vendor->payouts()->first();

    $this->actingAs($admin)->patch(route('admin.payouts.release', $payout))
        ->assertRedirect(route('admin.payments.index'));

    expect($payout->fresh()->status)->toBe(PayoutStatus::Paid);
});

it('serves the seller api only for that shops data', function () {
    [$seller, $vendor] = vendorShop();
    $other = Product::factory()->create();

    $login = $this->postJson('/api/v1/login', [
        'email' => $seller->email,
        'password' => 'password',
        'device_name' => 'flutter',
    ])->assertOk();

    $token = $login->json('token');

    $this->withToken($token)->getJson('/api/v1/vendor/dashboard')
        ->assertOk()
        ->assertJsonPath('shop.name', $vendor->name);

    $this->withToken($token)->putJson('/api/v1/vendor/products/'.$other->id, [
        'category_id' => $other->category_id,
        'title' => 'Stolen',
        'price' => 10,
        'stock' => 1,
        'status' => 'draft',
    ])->assertNotFound();
});
