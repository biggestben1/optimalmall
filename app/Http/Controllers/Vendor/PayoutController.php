<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Vendor/Payouts/Index', Portal::current()->payouts());
    }

    public function updateBank(Request $request): RedirectResponse
    {
        Portal::current()->saveBank($request->all());

        return redirect()->route('vendor.payouts.index')->with('status', 'Bank details saved.');
    }

    public function store(Request $request): RedirectResponse
    {
        Portal::current()->requestPayout($request->all());

        return redirect()->route('vendor.payouts.index')->with('status', 'Payout requested. It will be released after payment verification.');
    }
}
