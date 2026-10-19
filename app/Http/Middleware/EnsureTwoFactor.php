<?php

namespace App\Http\Middleware;

use App\Support\TwoFactor;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && TwoFactor::enabled($user) && ! $request->session()->get('two_factor.passed')) {
            $id = $user->id;
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            $request->session()->put('login.two_factor_id', $id);

            return redirect()->route('two-factor.login');
        }

        return $next($request);
    }
}
