<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function edit(): Response
    {
        $user = Portal::current()->user;

        return Inertia::render('Vendor/Settings/Edit', [
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        Portal::current()->updateAccount($request->all());

        return back()->with('status', 'Account saved.');
    }

    public function password(Request $request): RedirectResponse
    {
        Portal::current()->updatePassword($request->all());

        return back()->with('status', 'Password updated.');
    }
}
