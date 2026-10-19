<?php

use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureAdminEnrolled;
use App\Http\Middleware\EnsureAdminPermission;
use App\Http\Middleware\EnsureCustomer;
use App\Http\Middleware\EnsureFinanceUser;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\EnsureTwoFactor;
use App\Http\Middleware\EnsureVendor;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'super_admin' => EnsureSuperAdmin::class,
            'admin' => EnsureAdmin::class,
            'admin.can' => EnsureAdminPermission::class,
            'admin.two_factor' => EnsureTwoFactor::class,
            'admin.enrolled' => EnsureAdminEnrolled::class,
            'finance.user' => EnsureFinanceUser::class,
            'customer' => EnsureCustomer::class,
            'vendor' => EnsureVendor::class,
        ]);
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
