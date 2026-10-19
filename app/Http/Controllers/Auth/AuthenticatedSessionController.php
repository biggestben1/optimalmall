<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Support\AdminAccess;
use App\Support\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => __('These credentials do not match our records.'),
            ]);
        }

        $user = $request->user();

        if ($user && TwoFactor::enabled($user)) {
            $remember = $request->boolean('remember');
            Auth::logout();
            $request->session()->regenerate();
            $request->session()->put('login.two_factor_id', $user->id);
            $request->session()->put('login.remember', $remember);

            return redirect()->route('two-factor.login');
        }

        $request->session()->regenerate();
        $request->session()->put('two_factor.passed', true);

        $default = match (true) {
            $user?->role === UserRole::Accountant => route('accountant.dashboard'),
            $user && AdminAccess::isStaff($user) => route('admin.dashboard'),
            $user?->isVendor() => route('vendor.dashboard'),
            default => route('dashboard'),
        };

        return redirect()->intended($default);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
