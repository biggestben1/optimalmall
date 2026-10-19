<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationDispatch;
use App\Services\Marketplace\Notifier;
use App\Services\Vendor\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $dispatches = NotificationDispatch::query()
            ->latest()
            ->paginate(20)
            ->through(fn (NotificationDispatch $dispatch) => [
                'id' => $dispatch->id,
                'subject' => $dispatch->subject,
                'audience' => ucfirst($dispatch->audience),
                'channels' => implode(', ', $dispatch->channels ?? []),
                'recipients' => $dispatch->recipients,
                'sent' => $dispatch->sent,
                'status' => str_replace('_', ' ', $dispatch->status),
                'created_at' => $dispatch->created_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/Notifications/Index', [
            'dispatches' => $dispatches,
            'sms_ready' => filled(config('services.sms.url')),
            'mail_ready' => filled(config('mail.default')),
        ]);
    }

    public function store(Request $request, Notifier $notifier): RedirectResponse
    {
        $data = $request->validate([
            'audience' => ['required', Rule::in(['vendors', 'customers', 'staff'])],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['required', Rule::in(['in_app', 'email', 'sms'])],
            'subject' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $dispatch = $notifier->send(
            $request->user(),
            $data['audience'],
            $data['channels'],
            $data['subject'],
            $data['body'],
        );
        AuditLogger::record('notification.sent', $dispatch, [
            'audience' => $dispatch->audience,
            'status' => $dispatch->status,
        ]);

        return back()->with('status', 'Notification recorded. In-app messages reach seller shops. Email and SMS send only for the channels you selected and the integrations that are configured.');
    }
}
