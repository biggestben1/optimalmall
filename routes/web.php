<?php

use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\WalletController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\ContentController;
use App\Http\Controllers\Storefront\HelpController;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\ProductController;
use App\Http\Controllers\Storefront\ReviewController;
use App\Http\Controllers\Storefront\ShopController;
use App\Http\Controllers\Storefront\TrackController;
use App\Http\Controllers\Storefront\WishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/{product:slug}', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{product:slug}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{product:slug}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::post('/checkout/coupon', [CheckoutController::class, 'applyCoupon'])->name('checkout.coupon');
Route::delete('/checkout/coupon', [CheckoutController::class, 'removeCoupon'])->name('checkout.coupon.destroy');
Route::get('/orders/{order:number}', [CheckoutController::class, 'show'])->name('checkout.show');
Route::get('/shops', [ShopController::class, 'index'])->name('shops.index');
Route::get('/shops/{vendor:slug}', [ShopController::class, 'show'])->name('shops.show');
Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
Route::post('/wishlist/{product:slug}', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
Route::get('/track', [TrackController::class, 'create'])->name('track.create');
Route::post('/track', [TrackController::class, 'store'])->name('track.store');
Route::get('/help', [HelpController::class, 'create'])->name('help.create');
Route::post('/help', [HelpController::class, 'store'])->name('help.store');
Route::get('/pages/{page:slug}', [ContentController::class, 'page'])->name('pages.show');
Route::get('/blog', [ContentController::class, 'blog'])->name('blog.index');
Route::get('/blog/{post:slug}', [ContentController::class, 'post'])->name('blog.show');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::middleware('customer')->group(function () {
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
        Route::post('/wallet/fund', [WalletController::class, 'fund'])->name('wallet.fund');
        Route::post('/wallet/funding', [WalletController::class, 'fundWithProof'])->name('wallet.funding.store');
        Route::post('/wallet/orders/{order}/pay', [WalletController::class, 'pay'])->name('wallet.pay');
        Route::get('/wallet/statement', [WalletController::class, 'statement'])->name('wallet.statement');
        Route::get('/wallet/transactions/{transaction}', [WalletController::class, 'receipt'])->name('wallet.receipt');
        Route::get('/account/orders', [CustomerOrderController::class, 'index'])->name('account.orders.index');
        Route::get('/account/orders/{order:number}', [CustomerOrderController::class, 'show'])->name('account.orders.show');
        Route::post('/account/orders/{order:number}/return', [CustomerOrderController::class, 'returnItem'])->name('account.orders.return');
        Route::post('/products/{product:slug}/reviews', [ReviewController::class, 'store'])->name('products.reviews.store');
    });
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/accountant.php';
require __DIR__.'/vendor.php';
