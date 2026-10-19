<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Services\Vendor\AuditLogger;
use App\Services\Vendor\Earnings;
use App\Support\MarketplaceSettings;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommissionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $vendors = Vendor::query()
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(function (Vendor $vendor) {
                $summary = (new Earnings($vendor))->summary();

                return [
                    'id' => $vendor->id,
                    'name' => $vendor->name,
                    'commission_rate' => $vendor->commission_rate !== null ? (float) $vendor->commission_rate : null,
                    'gross' => Money::format($summary['gross']),
                    'commission' => Money::format($summary['commission']),
                    'available' => Money::format($summary['available']),
                ];
            });

        return Inertia::render('Admin/Commissions/Index', [
            'vendors' => $vendors,
            'filters' => ['search' => $search],
            'commission_rate' => (float) config('marketplace.commission_rate'),
        ]);
    }

    public function updateGlobal(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'commission_rate' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        MarketplaceSettings::put([
            'commission_rate' => $data['commission_rate'],
        ]);
        AuditLogger::record('commission.global', null, ['rate' => (float) $data['commission_rate']]);

        return back()->with('status', 'Marketplace commission updated. Existing order lines keep the rate already stored on them.');
    }

    public function updateVendor(Request $request, Vendor $vendor): RedirectResponse
    {
        $data = $request->validate([
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        $rate = $data['commission_rate'];
        $vendor->update([
            'commission_rate' => $rate === null || $rate === '' ? null : $rate,
        ]);
        AuditLogger::record('commission.vendor', $vendor, [
            'rate' => $vendor->commission_rate,
        ], $vendor);

        return back()->with('status', 'Seller commission updated.');
    }
}
