<?php

use App\Http\Controllers\Vendor\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'vendor'])
    ->prefix('vendor')
    ->name('vendor.')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');
    });
