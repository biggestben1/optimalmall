<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Support\AdminAccess;
use App\Support\Cart;
use App\Support\Wishlist;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->value,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'is_vendor' => $user->isVendor(),
                    'shop_name' => $user->isVendor() ? $user->vendor?->name : null,
                    'shop_status' => $user->isVendor() ? $user->vendor?->status?->value : null,
                    'unread_notifications' => $user->isVendor()
                        ? (int) $user->vendor?->notifications()->whereNull('read_at')->count()
                        : 0,
                    'admin_modules' => AdminAccess::modulesFor($user),
                ] : null,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'cart' => fn () => app(Cart::class)->summary(),
            'wishlist' => fn () => ['count' => app(Wishlist::class)->count()],
            'navCategories' => fn () => Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->take(7)
                ->get(['id', 'name', 'slug', 'icon']),
        ];
    }
}
