<?php

use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CommissionController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReturnController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TicketController;
use App\Http\Controllers\Admin\VendorController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin', 'admin.two_factor', 'throttle:120,1'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('security', [SecurityController::class, 'edit'])->name('security.edit');
        Route::post('security/start', [SecurityController::class, 'start'])->name('security.start');
        Route::post('security', [SecurityController::class, 'store'])->name('security.store');
        Route::delete('security', [SecurityController::class, 'destroy'])->name('security.destroy');

        Route::middleware('admin.enrolled')->group(function () {
            Route::get('/', DashboardController::class)->middleware('admin.can:dashboard')->name('dashboard');

            Route::middleware('admin.can:catalogue')->group(function () {
                Route::resource('products', ProductController::class)->except(['show']);
                Route::post('products/{product}/approval', [ProductController::class, 'approval'])->name('products.approval');
                Route::patch('products/{product}/feature', [ProductController::class, 'feature'])->name('products.feature');
                Route::resource('categories', CategoryController::class)->except(['show']);
                Route::resource('brands', BrandController::class)->except(['show']);
            });

            Route::middleware('admin.can:vendors')->group(function () {
                Route::resource('vendors', VendorController::class)->except(['show']);
                Route::patch('vendors/{vendor}/verification', [VendorController::class, 'verify'])->name('vendors.verify');
            });

            Route::middleware('admin.can:customers')->group(function () {
                Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
            });

            Route::middleware('admin.can:staff')->group(function () {
                Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
                Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
                Route::patch('roles/{user}', [RoleController::class, 'update'])->name('roles.update');
            });

            Route::middleware('admin.can:orders')->group(function () {
                Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
                Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
                Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
            });

            Route::middleware('admin.can:inventory')->group(function () {
                Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
                Route::patch('inventory/{product}', [InventoryController::class, 'update'])->name('inventory.update');
                Route::get('shipping', [InventoryController::class, 'shipping'])->name('shipping.index');
                Route::patch('shipping/{orderItem}', [InventoryController::class, 'updateShipping'])->name('shipping.update');
            });

            Route::middleware('admin.can:finance')->group(function () {
                Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
                Route::patch('settlements/{settlement}', [PaymentController::class, 'update'])->name('settlements.update');
                Route::patch('payouts/{payout}/approve', [PaymentController::class, 'approve'])->name('payouts.approve');
                Route::patch('payouts/{payout}/reject', [PaymentController::class, 'reject'])->name('payouts.reject');
                Route::patch('payouts/{payout}', [PaymentController::class, 'release'])->name('payouts.release');
                Route::post('payouts/{payout}/confirm', [PaymentController::class, 'confirm'])->name('payouts.confirm');
                Route::get('commissions', [CommissionController::class, 'index'])->name('commissions.index');
                Route::put('commissions', [CommissionController::class, 'updateGlobal'])->name('commissions.update');
                Route::patch('commissions/{vendor}', [CommissionController::class, 'updateVendor'])->name('commissions.vendor');
            });

            Route::middleware('admin.can:promotions')->group(function () {
                Route::resource('banners', BannerController::class)->except(['show']);
                Route::resource('coupons', CouponController::class)->except(['show']);
                Route::resource('advertisements', AdvertisementController::class)->except(['show']);
            });

            Route::middleware('admin.can:content')->group(function () {
                Route::resource('pages', PageController::class)->except(['show']);
                Route::resource('posts', PostController::class)->except(['show']);
            });

            Route::middleware('admin.can:support')->group(function () {
                Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
                Route::patch('reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
                Route::delete('reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
                Route::get('returns', [ReturnController::class, 'index'])->name('returns.index');
                Route::patch('returns/{orderReturn}', [ReturnController::class, 'update'])->name('returns.update');
                Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index');
                Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
                Route::patch('tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
            });

            Route::get('reports', ReportController::class)->middleware('admin.can:reports')->name('reports');

            Route::middleware('admin.can:notifications')->group(function () {
                Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
                Route::post('notifications', [NotificationController::class, 'store'])->name('notifications.store');
            });

            Route::get('audit', [AuditLogController::class, 'index'])->middleware('admin.can:audit')->name('audit.index');

            Route::middleware('admin.can:settings')->group(function () {
                Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
                Route::put('settings', [SettingController::class, 'update'])->name('settings.update');
                Route::post('settings/backup', [SettingController::class, 'backup'])->name('settings.backup');
                Route::get('settings/backup', [SettingController::class, 'downloadBackup'])->name('settings.backup.download');
            });
        });
    });
