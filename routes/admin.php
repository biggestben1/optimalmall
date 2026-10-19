<?php

use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReturnController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\VendorController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'super_admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::resource('products', ProductController::class)->except(['show']);
        Route::post('products/{product}/approval', [ProductController::class, 'approval'])->name('products.approval');
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('vendors', VendorController::class)->except(['show']);
        Route::resource('banners', BannerController::class)->except(['show']);
        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::patch('settlements/{settlement}', [PaymentController::class, 'update'])->name('settlements.update');
        Route::patch('payouts/{payout}', [PaymentController::class, 'release'])->name('payouts.release');
        Route::resource('coupons', CouponController::class)->except(['show']);
        Route::resource('advertisements', AdvertisementController::class)->except(['show']);
        Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::patch('reviews/{review}', [ReviewController::class, 'update'])->name('reviews.update');
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');
        Route::get('returns', [ReturnController::class, 'index'])->name('returns.index');
        Route::patch('returns/{orderReturn}', [ReturnController::class, 'update'])->name('returns.update');
        Route::get('reports', ReportController::class)->name('reports');
        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
        Route::patch('roles/{user}', [RoleController::class, 'update'])->name('roles.update');
    });
