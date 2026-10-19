<?php

use App\Http\Controllers\Vendor\DashboardController;
use App\Http\Controllers\Vendor\FinanceController;
use App\Http\Controllers\Vendor\InventoryController;
use App\Http\Controllers\Vendor\NotificationController;
use App\Http\Controllers\Vendor\OrderController;
use App\Http\Controllers\Vendor\PayoutController;
use App\Http\Controllers\Vendor\ProductController;
use App\Http\Controllers\Vendor\PromotionController;
use App\Http\Controllers\Vendor\ReportController;
use App\Http\Controllers\Vendor\ReviewController;
use App\Http\Controllers\Vendor\SettingsController;
use App\Http\Controllers\Vendor\StoreController;
use App\Http\Controllers\Vendor\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'vendor'])
    ->prefix('vendor')
    ->name('vendor.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::get('store', [StoreController::class, 'edit'])->name('store.edit');
        Route::put('store', [StoreController::class, 'update'])->name('store.update');

        Route::resource('products', ProductController::class)->except(['show']);
        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::patch('inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');

        Route::get('finance', [FinanceController::class, 'index'])->name('finance.index');
        Route::get('payouts', [PayoutController::class, 'index'])->name('payouts.index');
        Route::post('payouts', [PayoutController::class, 'store'])->name('payouts.store');
        Route::put('bank-account', [PayoutController::class, 'updateBank'])->name('bank.update');

        Route::get('promotions', [PromotionController::class, 'index'])->name('promotions.index');
        Route::get('promotions/coupons/create', [PromotionController::class, 'createCoupon'])->name('promotions.coupons.create');
        Route::post('promotions/coupons', [PromotionController::class, 'storeCoupon'])->name('promotions.coupons.store');
        Route::get('promotions/coupons/{coupon}/edit', [PromotionController::class, 'editCoupon'])->name('promotions.coupons.edit');
        Route::put('promotions/coupons/{coupon}', [PromotionController::class, 'updateCoupon'])->name('promotions.coupons.update');
        Route::delete('promotions/coupons/{coupon}', [PromotionController::class, 'destroyCoupon'])->name('promotions.coupons.destroy');
        Route::get('promotions/campaigns/create', [PromotionController::class, 'createCampaign'])->name('promotions.campaigns.create');
        Route::post('promotions/campaigns', [PromotionController::class, 'storeCampaign'])->name('promotions.campaigns.store');
        Route::get('promotions/campaigns/{campaign}/edit', [PromotionController::class, 'editCampaign'])->name('promotions.campaigns.edit');
        Route::put('promotions/campaigns/{campaign}', [PromotionController::class, 'updateCampaign'])->name('promotions.campaigns.update');
        Route::delete('promotions/campaigns/{campaign}', [PromotionController::class, 'destroyCampaign'])->name('promotions.campaigns.destroy');

        Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::post('reviews/{review}/reply', [ReviewController::class, 'reply'])->name('reviews.reply');

        Route::get('messages', [TicketController::class, 'index'])->name('tickets.index');
        Route::get('messages/create', [TicketController::class, 'create'])->name('tickets.create');
        Route::post('messages', [TicketController::class, 'store'])->name('tickets.store');
        Route::get('messages/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
        Route::post('messages/{ticket}', [TicketController::class, 'reply'])->name('tickets.reply');

        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/read', [NotificationController::class, 'read'])->name('notifications.read');

        Route::get('reports', ReportController::class)->name('reports');
        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::put('settings/password', [SettingsController::class, 'password'])->name('settings.password');
    });
