<?php

use App\Enums\PaymentStatus;
use App\Enums\ReturnStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Page;
use App\Models\Payment;
use App\Models\PaymentEvent;
use App\Models\User;
use App\Models\Vendor;
use App\Services\Vendor\Earnings;
use App\Support\MarketplaceSettings;
use App\Support\Totp;
use App\Support\TwoFactor;
use Inertia\Testing\AssertableInertia as Assert;

it('keeps customers and sellers out of the master admin', function () {
    $this->actingAs(User::factory()->create())->get(route('admin.dashboard'))->assertForbidden();
    $this->actingAs(User::factory()->create(['role' => UserRole::Vendor]))->get(route('admin.brands.index'))->assertForbidden();
});

it('limits staff to the modules for their role', function () {
    $accountant = User::factory()->create(['role' => UserRole::Accountant]);
    $warehouse = User::factory()->create(['role' => UserRole::WarehouseStaff]);

    $this->actingAs($accountant)->get(route('admin.payments.index'))->assertOk();
    $this->actingAs($accountant)->get(route('admin.products.index'))->assertForbidden();
    $this->actingAs($accountant)->get(route('admin.settings.edit'))->assertForbidden();

    $this->actingAs($warehouse)->get(route('admin.inventory.index'))->assertOk();
    $this->actingAs($warehouse)->get(route('admin.payments.index'))->assertForbidden();
});

it('applies the saved marketplace commission on the server', function () {
    MarketplaceSettings::put(['commission_rate' => '25']);
    $vendor = Vendor::factory()->create(['commission_rate' => null]);
    $item = new OrderItem(['line_total' => 1000]);

    expect((new Earnings($vendor))->rateFor($item))->toBe(25.0);
});

it('publishes a page and a brand from the master admin', function () {
    $admin = User::factory()->superAdmin()->create();

    $this->actingAs($admin)->post(route('admin.brands.store'), [
        'name' => 'Samsung',
        'is_active' => 1,
    ])->assertRedirect(route('admin.brands.index'));

    $this->actingAs($admin)->post(route('admin.pages.store'), [
        'title' => 'About OptimalMall',
        'body' => 'A multi-vendor marketplace.',
        'is_published' => 1,
    ])->assertRedirect(route('admin.pages.index'));

    expect(Page::query()->where('slug', 'about-optimalmall')->first()->is_published)->toBeTrue();

    $this->get(route('pages.show', 'about-optimalmall'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Storefront/Page'));
});

it('refuses to change a return after it has been refunded', function () {
    $admin = User::factory()->superAdmin()->create();
    $order = Order::query()->create([
        'number' => 'OM-REFUND-1',
        'customer_name' => 'Ada',
        'customer_email' => 'ada@example.com',
        'status' => 'pending',
        'subtotal' => 1000,
        'total' => 1000,
        'placed_at' => now(),
    ]);
    $return = OrderReturn::query()->create([
        'order_id' => $order->id,
        'reason' => 'Damaged',
        'status' => ReturnStatus::Requested,
        'refund_amount' => 1000,
    ]);

    $this->actingAs($admin)->patch(route('admin.returns.update', $return), [
        'status' => ReturnStatus::Refunded->value,
    ])->assertRedirect();

    $this->actingAs($admin)->patch(route('admin.returns.update', $return), [
        'status' => ReturnStatus::Approved->value,
    ])->assertRedirect();

    expect($return->fresh()->status)->toBe(ReturnStatus::Refunded);
});

it('verifies a payment webhook once and ignores a duplicate callback', function () {
    config(['services.payments.webhook_secret' => 'test-secret']);

    $order = Order::query()->create([
        'number' => 'OM-HOOK-1',
        'customer_name' => 'Ada',
        'customer_email' => 'ada@example.com',
        'status' => 'pending',
        'subtotal' => 2500,
        'total' => 2500,
        'placed_at' => now(),
    ]);
    $payment = Payment::query()->create([
        'order_id' => $order->id,
        'reference' => 'PAY-HOOK-1',
        'method' => 'card',
        'amount' => 2500,
        'status' => PaymentStatus::Pending,
    ]);

    $payload = ['reference' => 'PAY-HOOK-1', 'status' => 'successful', 'amount' => 2500];
    $body = json_encode($payload);
    $headers = ['X-Payment-Signature' => hash_hmac('sha256', $body, 'test-secret')];

    $this->call('POST', '/api/v1/payments/webhook', [], [], [], $this->transformHeadersToServerVars([
        ...$headers,
        'CONTENT_TYPE' => 'application/json',
        'Accept' => 'application/json',
    ]), $body)->assertOk();

    $paidAt = $payment->fresh()->paid_at;
    expect($payment->fresh()->status)->toBe(PaymentStatus::Successful)
        ->and(PaymentEvent::query()->count())->toBe(1);

    $this->call('POST', '/api/v1/payments/webhook', [], [], [], $this->transformHeadersToServerVars([
        ...$headers,
        'CONTENT_TYPE' => 'application/json',
        'Accept' => 'application/json',
    ]), $body)->assertOk()->assertJson(['duplicate' => true]);

    expect($payment->fresh()->paid_at?->toDateTimeString())->toBe($paidAt?->toDateTimeString())
        ->and(PaymentEvent::query()->count())->toBe(2);
});

it('asks for a second factor before opening the admin console', function () {
    $secret = Totp::generateSecret();
    $admin = User::factory()->superAdmin()->create();
    $admin->forceFill([
        'two_factor_secret' => $secret,
        'two_factor_confirmed_at' => now(),
        'two_factor_recovery_codes' => TwoFactor::hashCodes(['RECOVERY11']),
    ])->save();

    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect(route('two-factor.login'));
    $this->assertGuest();

    $this->post('/two-factor-challenge', ['code' => '000000'])->assertSessionHasErrors('code');
    $this->assertGuest();

    $this->post('/two-factor-challenge', ['code' => Totp::currentCode($secret)])
        ->assertRedirect(route('admin.dashboard'));
    $this->assertAuthenticatedAs($admin);
});
