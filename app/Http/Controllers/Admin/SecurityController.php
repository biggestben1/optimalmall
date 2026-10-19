<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Vendor\AuditLogger;
use App\Support\MarketplaceSettings;
use App\Support\Totp;
use App\Support\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Admin/Security/Edit', [
            'enabled' => TwoFactor::enabled($request->user()),
            'required' => TwoFactor::requiredFor($request->user()),
            'pending_secret' => $request->session()->get('security.two_factor_secret'),
            'recovery_codes' => $request->session()->get('recovery_codes'),
        ]);
    }

    public function start(Request $request): RedirectResponse
    {
        $secret = Totp::generateSecret();
        $request->session()->put('security.two_factor_secret', $secret);

        return back();
    }

    public function store(Request $request): RedirectResponse
    {
        $secret = (string) $request->session()->get('security.two_factor_secret');
        abort_unless($secret !== '', 422);

        $code = $request->validate([
            'code' => ['required', 'string'],
        ])['code'];

        if (! Totp::verify($secret, $code)) {
            return back()->withErrors(['code' => 'That code did not match. Check the time on your authenticator app and try again.']);
        }

        $codes = TwoFactor::recoveryCodes();
        $request->user()->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => TwoFactor::hashCodes($codes),
            'two_factor_confirmed_at' => now(),
        ])->save();

        $request->session()->forget('security.two_factor_secret');
        $request->session()->put('two_factor.passed', true);
        $request->session()->flash('recovery_codes', $codes);
        AuditLogger::record('security.two_factor_enabled', $request->user());

        return back()->with('status', 'Two-factor authentication is on. Save the recovery codes shown on this page.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        if (MarketplaceSettings::enabled('two_factor_required') && TwoFactor::requiredFor($request->user())) {
            return back()->with('error', 'Two-factor authentication is required for this role.');
        }

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
        AuditLogger::record('security.two_factor_disabled', $request->user());

        return back()->with('status', 'Two-factor authentication is off.');
    }
}
