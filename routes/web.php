<?php

use App\Http\Controllers\Customer\WalletController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\ContentController;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/{product:slug}', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{product:slug}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{product:slug}', [CartController::class, 'destroy'])->name('cart.destroy');
Route::get('/pages/{page:slug}', [ContentController::class, 'page'])->name('pages.show');
Route::get('/blog', [ContentController::class, 'blog'])->name('blog.index');
Route::get('/blog/{post:slug}', [ContentController::class, 'post'])->name('blog.show');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::middleware('customer')->group(function () {
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
        Route::post('/wallet/fund', [WalletController::class, 'fund'])->name('wallet.fund');
        Route::post('/wallet/orders/{order}/pay', [WalletController::class, 'pay'])->name('wallet.pay');
        Route::get('/wallet/statement', [WalletController::class, 'statement'])->name('wallet.statement');
        Route::get('/wallet/transactions/{transaction}', [WalletController::class, 'receipt'])->name('wallet.receipt');
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
