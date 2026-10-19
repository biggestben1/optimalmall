<?php

use App\Enums\PaymentStatus;
use App\Enums\PayoutStatus;
use App\Enums\ReturnStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\User;
use App\Models\Vendor;
use App\Models\WalletFundingRequest;
use App\Models\WalletTransaction;
use App\Services\Accounting\Books;
use App\Support\MarketplaceSettings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

function signedWebhook(array $payload): TestResponse
{
    config(['services.payments.webhook_secret' => 'test-secret']);
    $body = json_encode($payload);

    return test()->call('POST', '/api/v1/payments/webhook', [], [], [], test()->transformHeadersToServerVars([
        'X-Payment-Signature' => hash_hmac('sha256', $body, 'test-secret'),
        'CONTENT_TYPE' => 'application/json',
        'Accept' => 'application/json',
    ]), $body);
}

it('keeps customer deposits off until the policy is enabled', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)->post(route('wallet.fund'), ['amount' => 1000])
        ->assertSessionHasErrors('amount');

    $this->actingAs($customer)->get(route('wallet.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('deposits_enabled', false)->where('balance', '₦0'));
});

it('credits a wallet deposit once when the same webhook arrives twice', function () {
    $customer = User::factory()->create();
    MarketplaceSettings::put(['wallet_deposits_enabled' => '1']);

    $this->actingAs($customer)->post(route('wallet.fund'), ['amount' => 2500])->assertRedirect();
    $payment = Payment::query()->whereNull('order_id')->first();

    signedWebhook(['reference' => $payment->reference, 'status' => 'successful', 'amount' => 2500])->assertOk();
    signedWebhook(['reference' => $payment->reference, 'status' => 'successful', 'amount' => 2500])->assertOk();

    $wallet = app(Books::class)->customerWallet($customer);

    expect($wallet->balance())->toBe(2500.0)
        ->and(WalletTransaction::query()->where('status', 'posted')->count())->toBe(1)
        ->and((float) WalletTransaction::query()->where('status', 'posted')->where('direction', 'credit')->sum('amount'))
        ->toBe($wallet->balance());
});

it('pays an eligible order from the wallet and refuses a second payment', function () {
    $customer = User::factory()->create();
    $admin = User::factory()->superAdmin()->create();
    $vendor = Vendor::factory()->create();
    $wallet = app(Books::class)->customerWallet($customer);
    $adjustment = app(Books::class)->prepareAdjustment($wallet, 'credit', 8000, 'Opening credit', $admin);
    app(Books::class)->approveAdjustment($adjustment, $admin);

    $order = Order::query()->create([
        'user_id' => $customer->id,
        'number' => 'OM-WALLET-1',
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'status' => 'pending',
        'subtotal' => 3000,
        'total' => 3000,
        'placed_at' => now(),
    ]);
    OrderItem::query()->create([
        'order_id' => $order->id,
        'vendor_id' => $vendor->id,
        'title' => 'Headset',
        'quantity' => 1,
        'unit_price' => 3000,
        'line_total' => 3000,
    ]);

    $this->actingAs($customer)->post(route('wallet.pay', $order))->assertRedirect();

    expect($order->payments()->where('status', PaymentStatus::Successful)->count())->toBe(1)
        ->and(app(Books::class)->customerWallet($customer)->balance())->toBe(5000.0);

    $this->actingAs($customer)->post(route('wallet.pay', $order))->assertSessionHasErrors('order');

    $wallet->update(['status' => 'frozen']);
    $second = Order::query()->create([
        'user_id' => $customer->id,
        'number' => 'OM-WALLET-2',
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'status' => 'pending',
        'subtotal' => 1000,
        'total' => 1000,
        'placed_at' => now(),
    ]);

    $this->actingAs($customer)->post(route('wallet.pay', $second))->assertSessionHasErrors('wallet');
});

it('stops an accountant from confirming payouts or changing wallet policy', function () {
    $accountant = User::factory()->create(['role' => UserRole::Accountant]);
    $vendor = Vendor::factory()->create();
    $payout = Payout::query()->create([
        'vendor_id' => $vendor->id,
        'reference' => 'PO-LOCK-1',
        'amount' => 1500,
        'status' => PayoutStatus::Processing,
    ]);

    $this->actingAs($accountant)->get(route('accountant.dashboard'))->assertOk();
    $this->actingAs($accountant)->get(route('accountant.policy'))->assertForbidden();
    $this->actingAs($accountant)->post(route('admin.payouts.confirm', $payout), [
        'password' => 'password',
        'provider_reference' => 'BANK-9',
    ])->assertForbidden();

    expect($payout->fresh()->status)->toBe(PayoutStatus::Processing);
});

it('posts a refund to the customer wallet once', function () {
    $admin = User::factory()->superAdmin()->create();
    $customer = User::factory()->create();
    $vendor = Vendor::factory()->create();
    $order = Order::query()->create([
        'user_id' => $customer->id,
        'number' => 'OM-REFUND-1',
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'status' => 'paid',
        'subtotal' => 4000,
        'total' => 4000,
        'placed_at' => now(),
    ]);
    OrderItem::query()->create([
        'order_id' => $order->id,
        'vendor_id' => $vendor->id,
        'title' => 'Cable',
        'quantity' => 1,
        'unit_price' => 4000,
        'line_total' => 4000,
    ]);
    $return = OrderReturn::query()->create([
        'order_id' => $order->id,
        'reason' => 'Faulty',
        'status' => ReturnStatus::Requested,
        'refund_amount' => 1000,
    ]);

    $this->actingAs($admin)->patch(route('admin.returns.update', $return), [
        'status' => ReturnStatus::Refunded->value,
    ])->assertRedirect();

    $this->actingAs($admin)->patch(route('admin.returns.update', $return), [
        'status' => ReturnStatus::Approved->value,
    ])->assertRedirect();

    $wallet = app(Books::class)->customerWallet($customer);

    expect($wallet->balance())->toBe(1000.0)
        ->and($wallet->transactions()->where('type', 'refund')->count())->toBe(1);
});

it('keeps an accountant adjustment pending until another person approves it', function () {
    $accountant = User::factory()->create(['role' => UserRole::Accountant]);
    $admin = User::factory()->superAdmin()->create();
    $customer = User::factory()->create();
    $wallet = app(Books::class)->customerWallet($customer);

    $this->actingAs($accountant)->post(route('accountant.wallets.adjust', $wallet), [
        'direction' => 'credit',
        'amount' => 750,
        'reason' => 'Goodwill',
    ])->assertRedirect();

    $adjustment = $wallet->adjustments()->first();
    expect($adjustment->status)->toBe('pending')
        ->and($wallet->fresh()->balance())->toBe(0.0);

    $this->actingAs($accountant)->post(route('accountant.adjustments.approve', $adjustment), [
        'password' => 'password',
    ])->assertForbidden();

    $this->actingAs($admin)->post(route('accountant.adjustments.approve', $adjustment), [
        'password' => 'password',
    ])->assertRedirect();

    expect($adjustment->fresh()->status)->toBe('approved')
        ->and($wallet->fresh()->balance())->toBe(750.0);
});

it('serves the customer wallet on the mobile api', function () {
    $customer = User::factory()->create();

    $login = $this->postJson('/api/v1/customer/login', [
        'email' => $customer->email,
        'password' => 'password',
        'device_name' => 'phone',
    ])->assertOk();

    $this->withToken($login->json('token'))->getJson('/api/v1/wallet')
        ->assertOk()
        ->assertJsonPath('balance', 0);
});

it('refuses a seller token on the customer wallet api', function () {
    $seller = User::factory()->create(['role' => UserRole::Vendor]);
    Vendor::factory()->create(['user_id' => $seller->id]);
    $token = $seller->createToken('phone')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/wallet')->assertForbidden();
});

it('credits a wallet only after an accountant approves the receipt', function () {
    Storage::fake('local');
    $customer = User::factory()->create();
    $accountant = User::factory()->create(['role' => UserRole::Accountant]);

    $this->actingAs($customer)->post(route('wallet.funding.store'), [
        'amount' => 4000,
        'proof' => UploadedFile::fake()->createWithContent('receipt.jpg', base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGf/9k=')),
    ])->assertRedirect();

    expect(app(Books::class)->customerWallet($customer)->balance())->toBe(0.0);

    $funding = WalletFundingRequest::query()->first();

    $this->actingAs($accountant)->post(route('accountant.funding.approve', $funding))->assertRedirect();

    expect(app(Books::class)->customerWallet($customer)->balance())->toBe(4000.0)
        ->and($funding->fresh()->status)->toBe('approved');
});

it('publishes the top-up account an accountant saves', function () {
    $accountant = User::factory()->create(['role' => UserRole::Accountant]);
    $customer = User::factory()->create();

    $this->actingAs($accountant)->post(route('accountant.wallets.funding-account'), [
        'funding_bank' => 'Test Bank',
        'funding_account_name' => 'OptimalMall',
        'funding_account_number' => '0123456789',
    ])->assertRedirect();

    $this->actingAs($customer)->get(route('wallet.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('account.bank', 'Test Bank')
            ->where('account.name', 'OptimalMall')
            ->where('account.number', '0123456789'));
});

it('leaves the wallet unchanged when the receipt is rejected', function () {
    Storage::fake('local');
    $customer = User::factory()->create();
    $accountant = User::factory()->create(['role' => UserRole::Accountant]);

    $this->actingAs($customer)->post(route('wallet.funding.store'), [
        'amount' => 1500,
        'proof' => UploadedFile::fake()->createWithContent('receipt.jpg', base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGf/9k=')),
    ])->assertRedirect();

    $funding = WalletFundingRequest::query()->first();

    $this->actingAs($accountant)->post(route('accountant.funding.reject', $funding), [
        'review_note' => 'The name on the receipt does not match.',
    ])->assertRedirect();

    expect(app(Books::class)->customerWallet($customer)->balance())->toBe(0.0)
        ->and($funding->fresh()->status)->toBe('rejected');
});
