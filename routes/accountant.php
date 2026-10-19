<?php

use App\Http\Controllers\Accountant\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'finance.user', 'admin.two_factor', 'admin.enrolled', 'throttle:120,1'])
    ->prefix('accountant')
    ->name('accountant.')
    ->group(function () {
        Route::get('/', [WorkspaceController::class, 'dashboard'])->name('dashboard');
        Route::get('transactions', [WorkspaceController::class, 'transactions'])->name('transactions');
        Route::get('wallets', [WorkspaceController::class, 'wallets'])->name('wallets');
        Route::get('funding', [WorkspaceController::class, 'funding'])->name('funding');
        Route::get('funding/{funding}/proof', [WorkspaceController::class, 'fundingProof'])->name('funding.proof');
        Route::post('funding/{funding}/approve', [WorkspaceController::class, 'approveFunding'])->name('funding.approve');
        Route::post('funding/{funding}/reject', [WorkspaceController::class, 'rejectFunding'])->name('funding.reject');
        Route::post('wallets/{wallet}/freeze', [WorkspaceController::class, 'freeze'])->name('wallets.freeze');
        Route::post('wallets/{wallet}/adjustments', [WorkspaceController::class, 'adjust'])->name('wallets.adjust');
        Route::post('adjustments/{adjustment}/approve', [WorkspaceController::class, 'approveAdjustment'])->name('adjustments.approve');
        Route::match(['get', 'post'], 'reconciliation', [WorkspaceController::class, 'reconcile'])->name('reconciliation');
        Route::get('payouts', [WorkspaceController::class, 'payouts'])->name('payouts');
        Route::get('refunds', [WorkspaceController::class, 'refunds'])->name('refunds');
        Route::match(['get', 'post'], 'expenses', [WorkspaceController::class, 'expenses'])->name('expenses');
        Route::post('expenses/{expense}/approve', [WorkspaceController::class, 'approveExpense'])->name('expenses.approve');
        Route::get('ledger', [WorkspaceController::class, 'ledger'])->name('ledger');
        Route::get('reports', [WorkspaceController::class, 'reports'])->name('reports');
        Route::match(['get', 'post'], 'periods', [WorkspaceController::class, 'periods'])->name('periods');
        Route::match(['get', 'put'], 'policy', [WorkspaceController::class, 'policy'])->name('policy');
    });
