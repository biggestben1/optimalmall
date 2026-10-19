<?php

namespace App\Http\Middleware;

use App\Support\TwoFactor;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminEnrolled
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && TwoFactor::mustEnroll($user)) {
            return redirect()
                ->route('admin.security.edit')
                ->with('error', 'Turn on two-factor authentication before using the admin console.');
        }

        return $next($request);
    }
}
