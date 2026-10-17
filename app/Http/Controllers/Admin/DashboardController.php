<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Enums\VendorStatus;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::query()->count(),
                'categories' => Category::query()->count(),
                'vendors' => Vendor::query()->count(),
                'customers' => User::query()->where('role', UserRole::Customer)->count(),
                'banners' => Banner::query()->count(),
                'active_vendors' => Vendor::query()->where('status', VendorStatus::Active)->count(),
                'active_products' => Product::query()->where('status', ProductStatus::Active)->count(),
                'low_stock' => Product::query()->where('stock', '<=', 5)->where('status', ProductStatus::Active)->count(),
                'pending_vendors' => Vendor::query()->where('status', VendorStatus::Pending)->count(),
            ],
        ]);
    }
}
