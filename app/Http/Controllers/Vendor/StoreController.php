<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Vendor/Store/Edit', [
            'shop' => Portal::current()->shopPayload(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        Portal::current()->updateShop($request->all());

        return redirect()->route('vendor.store.edit')->with('status', 'Store profile saved.');
    }
}
