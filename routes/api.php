<?php

use App\Http\Controllers\Api\CustomerWalletController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\VendorAuthController;
use App\Http\Controllers\Api\VendorPortalController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('login', [VendorAuthController::class, 'store'])->middleware('throttle:10,1');
    Route::post('payments/webhook', [PaymentWebhookController::class, 'store'])->middleware('throttle:60,1');
    Route::post('customer/login', [CustomerWalletController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware(['auth:sanctum', 'customer'])->prefix('wallet')->group(function () {
        Route::get('/', [CustomerWalletController::class, 'show']);
        Route::get('transactions', [CustomerWalletController::class, 'transactions']);
        Route::post('fund', [CustomerWalletController::class, 'fund']);
        Route::post('orders/{order}/pay', [CustomerWalletController::class, 'pay']);
    });

    Route::middleware(['auth:sanctum', 'vendor'])->prefix('vendor')->group(function () {
        Route::post('logout', [VendorAuthController::class, 'destroy']);
        Route::get('dashboard', [VendorPortalController::class, 'dashboard']);
        Route::get('store', [VendorPortalController::class, 'store']);
        Route::put('store', [VendorPortalController::class, 'updateStore']);
        Route::get('products', [VendorPortalController::class, 'products']);
        Route::post('products', [VendorPortalController::class, 'storeProduct']);
        Route::put('products/{product}', [VendorPortalController::class, 'updateProduct']);
        Route::delete('products/{product}', [VendorPortalController::class, 'destroyProduct']);
        Route::get('inventory', [VendorPortalController::class, 'inventory']);
        Route::patch('inventory/{product}', [VendorPortalController::class, 'updateInventory']);
        Route::get('orders', [VendorPortalController::class, 'orders']);
        Route::get('orders/{order}', [VendorPortalController::class, 'showOrder']);
        Route::patch('orders/{order}', [VendorPortalController::class, 'updateOrder']);
        Route::get('finance', [VendorPortalController::class, 'finance']);
        Route::get('payouts', [VendorPortalController::class, 'payouts']);
        Route::post('payouts', [VendorPortalController::class, 'storePayout']);
        Route::put('bank-account', [VendorPortalController::class, 'updateBank']);
        Route::get('coupons', [VendorPortalController::class, 'coupons']);
        Route::post('coupons', [VendorPortalController::class, 'storeCoupon']);
        Route::put('coupons/{coupon}', [VendorPortalController::class, 'updateCoupon']);
        Route::delete('coupons/{coupon}', [VendorPortalController::class, 'destroyCoupon']);
        Route::get('campaigns', [VendorPortalController::class, 'campaigns']);
        Route::post('campaigns', [VendorPortalController::class, 'storeCampaign']);
        Route::put('campaigns/{campaign}', [VendorPortalController::class, 'updateCampaign']);
        Route::delete('campaigns/{campaign}', [VendorPortalController::class, 'destroyCampaign']);
        Route::get('reviews', [VendorPortalController::class, 'reviews']);
        Route::post('reviews/{review}/reply', [VendorPortalController::class, 'replyReview']);
        Route::get('tickets', [VendorPortalController::class, 'tickets']);
        Route::post('tickets', [VendorPortalController::class, 'storeTicket']);
        Route::get('tickets/{ticket}', [VendorPortalController::class, 'showTicket']);
        Route::post('tickets/{ticket}', [VendorPortalController::class, 'replyTicket']);
        Route::get('notifications', [VendorPortalController::class, 'notifications']);
        Route::post('notifications/read', [VendorPortalController::class, 'readNotifications']);
        Route::get('reports', [VendorPortalController::class, 'reports']);
        Route::put('settings', [VendorPortalController::class, 'updateAccount']);
        Route::put('settings/password', [VendorPortalController::class, 'updatePassword']);
    });
});
