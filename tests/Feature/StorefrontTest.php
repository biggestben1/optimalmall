<?php

use App\Enums\CouponType;
use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\ReturnStatus;
use App\Enums\ReviewStatus;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\SupportTicket;
use App\Models\User;
use App\Models\Vendor;
use App\Services\Accounting\Books;
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

it('checks out a cart for pay on delivery and reduces stock', function () {
    $product = Product::factory()->create([
        'title' => 'Checkout Lamp',
        'status' => ProductStatus::Active,
        'price' => 4000,
        'stock' => 4,
    ]);

    $this->post(route('cart.store', $product), ['quantity' => 2]);

    $this->get(route('checkout.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Checkout')
            ->where('quote.shipping', 3500)
            ->where('quote.total', 11500)
        );

    $this->post(route('checkout.store'), [
        'customer_name' => 'Ada Okonkwo',
        'customer_email' => 'ada@example.com',
        'shipping_address' => '14 Broad Street, Lagos',
        'payment_method' => 'delivery',
    ])->assertRedirect();

    $order = Order::query()->first();

    expect($order->status)->toBe(OrderStatus::Pending)
        ->and((float) $order->total)->toBe(11500.0)
        ->and($order->items)->toHaveCount(1)
        ->and($product->fresh()->stock)->toBe(2)
        ->and(session('cart'))->toBeNull();

    $this->get(route('checkout.show', $order->number))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/OrderPlaced')
            ->where('order.number', $order->number)
            ->where('order.paid', false)
        );

    $this->get(route('checkout.create'))->assertRedirect(route('cart.index'));
});

it('pays a checkout from the customer wallet', function () {
    $customer = User::factory()->create();
    $admin = User::factory()->superAdmin()->create();
    $product = Product::factory()->create([
        'status' => ProductStatus::Active,
        'price' => 2000,
        'stock' => 1,
    ]);
    $wallet = app(Books::class)->customerWallet($customer);
    $adjustment = app(Books::class)->prepareAdjustment($wallet, 'credit', 10000, 'Checkout test', $admin);
    app(Books::class)->approveAdjustment($adjustment, $admin);

    $this->actingAs($customer)->post(route('cart.store', $product), ['quantity' => 1]);
    $this->actingAs($customer)->post(route('checkout.store'), [
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'shipping_address' => '8 Adeola Odeku, Lagos',
        'payment_method' => 'wallet',
    ])->assertRedirect();

    $order = Order::query()->first();

    expect($order->status)->toBe(OrderStatus::Paid)
        ->and($order->user_id)->toBe($customer->id)
        ->and($order->payments()->count())->toBe(1)
        ->and($product->fresh()->stock)->toBe(0);
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

it('saves a wishlist item and opens a shop', function () {
    $vendor = Vendor::factory()->create(['name' => 'Island Market']);
    $product = Product::factory()->create([
        'vendor_id' => $vendor->id,
        'status' => ProductStatus::Active,
        'title' => 'Woven Basket',
    ]);

    $this->post(route('wishlist.toggle', $product))->assertRedirect();
    $this->get(route('wishlist.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Storefront/Wishlist')->has('lines', 1));

    $this->get(route('shops.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Storefront/Shops')->has('shops', 1));

    $this->get(route('shops.show', $vendor->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Storefront/Shop')
            ->where('shop.name', 'Island Market')
            ->has('products.data', 1)
        );
});

it('applies a coupon and lets the buyer track the order', function () {
    $product = Product::factory()->create([
        'status' => ProductStatus::Active,
        'price' => 4000,
        'stock' => 4,
    ]);
    Coupon::query()->create([
        'code' => 'SAVE10',
        'type' => CouponType::Percent,
        'value' => 10,
        'min_order' => 0,
        'is_active' => true,
    ]);

    $this->post(route('cart.store', $product), ['quantity' => 2, 'buy_now' => true])
        ->assertRedirect(route('checkout.create'));
    $this->post(route('checkout.coupon'), ['code' => 'SAVE10'])->assertRedirect();
    $this->post(route('checkout.store'), [
        'customer_name' => 'Ada Okonkwo',
        'customer_email' => 'ada@example.com',
        'shipping_address' => '12 Admiralty Way, Lekki',
        'payment_method' => 'delivery',
    ])->assertRedirect();

    $order = Order::query()->first();

    expect((float) $order->total)->toBe(10700.0)
        ->and((float) $order->items->first()->line_total)->toBe(7200.0)
        ->and(Coupon::query()->first()->used_count)->toBe(1);

    auth()->logout();
    $this->post(route('track.store'), [
        'number' => $order->number,
        'email' => 'ada@example.com',
    ])->assertRedirect(route('checkout.show', $order->number));
    $this->get(route('checkout.show', $order->number))->assertOk();
});

it('keeps a review pending until it is published and records a return request', function () {
    $customer = User::factory()->create();
    $product = Product::factory()->create([
        'status' => ProductStatus::Active,
        'price' => 5000,
        'stock' => 2,
    ]);

    $this->actingAs($customer)->post(route('products.reviews.store', $product), [
        'rating' => 5,
        'body' => 'I have not bought this.',
    ])->assertForbidden();

    $this->actingAs($customer)->post(route('cart.store', $product), ['quantity' => 1]);
    $this->actingAs($customer)->post(route('checkout.store'), [
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'shipping_address' => '4 Bourdillon, Ikoyi',
        'payment_method' => 'delivery',
    ]);

    $order = Order::query()->first();
    $this->actingAs($customer)->post(route('account.orders.return', $order->number))->assertStatus(422);

    $order->update(['status' => OrderStatus::Delivered]);

    $this->actingAs($customer)->post(route('products.reviews.store', $product), [
        'rating' => 4,
        'body' => 'Solid basket, arrived well.',
    ])->assertRedirect();

    expect(Review::query()->first()->status)->toBe(ReviewStatus::Pending);

    $this->get(route('products.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('reviews', 0));

    $this->actingAs($customer)->post(route('account.orders.return', $order->number), [
        'reason' => 'Changed my mind',
        'refund_amount' => 1000,
    ])->assertRedirect();

    expect($order->fresh()->returns()->first()->status)->toBe(ReturnStatus::Requested);
});

it('opens a mall help ticket without a vendor', function () {
    $this->post(route('help.store'), [
        'name' => 'Ada Okonkwo',
        'email' => 'ada@example.com',
        'subject' => 'Where is my order?',
        'message' => 'The tracking page does not show a courier yet.',
    ])->assertRedirect();

    expect(SupportTicket::query()->first())
        ->vendor_id->toBeNull()
        ->subject->toBe('Where is my order?');
});
