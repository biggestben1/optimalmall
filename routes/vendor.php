<?php

use App\Http\Controllers\Vendor\DashboardController;
use App\Http\Controllers\Vendor\ProductController;
use App\Http\Controllers\Vendor\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'vendor'])
    ->prefix('vendor')
    ->name('vendor.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
        Route::get('reports', ReportController::class)->name('reports');
        Route::resource('products', ProductController::class)->except(['show']);
    });
