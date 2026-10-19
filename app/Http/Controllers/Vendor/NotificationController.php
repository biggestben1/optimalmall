<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Vendor/Notifications/Index', [
            'notifications' => Portal::current()->notifications(),
        ]);
    }

    public function read(): RedirectResponse
    {
        Portal::current()->markNotificationsRead();

        return back()->with('status', 'Notifications marked as read.');
    }
}
