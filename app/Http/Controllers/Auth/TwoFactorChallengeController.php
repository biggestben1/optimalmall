<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Totp;
use App\Support\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('login.two_factor_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('login.two_factor_id');
        $user = $userId ? User::query()->find($userId) : null;

        if (! $user || ! TwoFactor::enabled($user)) {
            return redirect()->route('login');
        }

        $code = $request->validate([
            'code' => ['required', 'string'],
        ])['code'];

        $valid = Totp::verify((string) $user->two_factor_secret, $code)
            || TwoFactor::consumeRecoveryCode($user, $code);

        if (! $valid) {
            throw ValidationException::withMessages([
                'code' => 'That authentication code is not valid.',
            ]);
        }

        Auth::login($user, (bool) $request->session()->pull('login.remember'));
        $request->session()->forget('login.two_factor_id');
        $request->session()->regenerate();
        $request->session()->put('two_factor.passed', true);

        $default = match (true) {
            $user->role === UserRole::Accountant => route('accountant.dashboard'),
            $user->isVendor() => route('vendor.dashboard'),
            $user->isCustomer() => route('dashboard'),
            default => route('admin.dashboard'),
        };

        return redirect()->intended($default);
    }
}
