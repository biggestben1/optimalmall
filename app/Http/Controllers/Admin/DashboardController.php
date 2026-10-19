<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Enums\ProductApproval;
use App\Enums\ProductStatus;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Enums\VendorStatus;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Product;
use App\Models\SupportTicket;
use App\Models\User;
use App\Models\Vendor;
use App\Services\Marketplace\Ledger;
use App\Support\MarketplaceSettings;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, Ledger $ledger): Response|RedirectResponse
    {
        if ($request->user()?->role === UserRole::Accountant) {
            return redirect()->route('accountant.dashboard');
        }

        $balances = $ledger->snapshot();
        $threshold = (int) MarketplaceSettings::get('low_stock_threshold', 5);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::query()->count(),
                'categories' => Category::query()->count(),
                'vendors' => Vendor::query()->count(),
                'customers' => User::query()->where('role', UserRole::Customer)->count(),
                'banners' => Banner::query()->count(),
                'active_vendors' => Vendor::query()->where('status', VendorStatus::Active)->count(),
                'active_products' => Product::query()->where('status', ProductStatus::Active)->count(),
                'low_stock' => Product::query()->where('stock', '<=', $threshold)->where('status', ProductStatus::Active)->count(),
                'pending_vendors' => Vendor::query()->where('status', VendorStatus::Pending)->count(),
                'orders' => Order::query()->count(),
                'open_orders' => Order::query()->whereNotIn('status', [OrderStatus::Delivered, OrderStatus::Cancelled])->count(),
                'pending_products' => Product::query()->where('approval_status', ProductApproval::Pending)->count(),
                'pending_payouts' => Payout::query()->where('status', PayoutStatus::Requested)->count(),
                'open_tickets' => SupportTicket::query()->where('status', '!=', TicketStatus::Closed)->count(),
                'revenue' => Money::format($balances['gross']),
                'commission' => Money::format($balances['commission']),
                'vendor_funds' => Money::format($balances['vendor_available']),
                'marketplace_revenue' => Money::format($balances['commission']),
            ],
        ]);
    }
}
