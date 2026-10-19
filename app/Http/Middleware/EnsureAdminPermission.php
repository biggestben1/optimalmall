<?php

namespace App\Http\Middleware;

use App\Support\AdminAccess;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next, string $module): Response
    {
        abort_unless(AdminAccess::allows($request->user(), $module), 403);

        return $next($request);
    }
}
