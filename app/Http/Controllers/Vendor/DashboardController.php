<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Services\Vendor\Portal;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        if (auth()->user()?->vendor === null) {
            return Inertia::render('Vendor/Dashboard', [
                'shop' => null,
                'stats' => [],
                'products' => [],
                'orders' => [],
                'notifications' => [],
            ]);
        }

        return Inertia::render('Vendor/Dashboard', Portal::current()->dashboard());
    }
}
