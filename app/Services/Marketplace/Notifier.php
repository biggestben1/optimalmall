<?php

namespace App\Services\Marketplace;

use App\Enums\UserRole;
use App\Models\NotificationDispatch;
use App\Models\User;
use App\Models\Vendor;
use App\Support\MarketplaceSettings;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class Notifier
{
    /**
     * @param  list<string>  $channels
     */
    public function send(User $actor, string $audience, array $channels, string $subject, string $body): NotificationDispatch
    {
        $recipients = $this->recipients($audience)->take(100);
        $sent = 0;

        foreach ($recipients as $recipient) {
            if (in_array('in_app', $channels, true) && $recipient['vendor'] instanceof Vendor) {
                $recipient['vendor']->notifyPortal($subject, $body);
                $sent++;
            }

            if (in_array('email', $channels, true) && MarketplaceSettings::enabled('notify_email', true) && filled($recipient['email'])) {
                try {
                    Mail::raw($body, function ($message) use ($recipient, $subject): void {
                        $message->to($recipient['email'])->subject($subject);
                    });
                    $sent++;
                } catch (\Throwable) {
                    // A mail failure is recorded by the sent count staying behind.
                }
            }

            if (in_array('sms', $channels, true) && $this->sendSms($recipient['phone'], $body)) {
                $sent++;
            }
        }

        $status = $sent > 0 ? 'sent' : 'recorded';

        if (in_array('sms', $channels, true) && ! filled(config('services.sms.url'))) {
            $status = $sent > 0 ? 'partial' : 'sms_skipped';
        }

        return NotificationDispatch::query()->create([
            'user_id' => $actor->id,
            'audience' => $audience,
            'channels' => $channels,
            'subject' => $subject,
            'body' => $body,
            'recipients' => $recipients->count(),
            'sent' => $sent,
            'status' => $status,
        ]);
    }

    /**
     * @return Collection<int, array{email: ?string, phone: ?string, vendor: ?Vendor}>
     */
    private function recipients(string $audience)
    {
        return match ($audience) {
            'vendors' => Vendor::query()->with('user')->get()->map(fn (Vendor $vendor) => [
                'email' => $vendor->user?->email ?? $vendor->email,
                'phone' => $vendor->phone,
                'vendor' => $vendor,
            ]),
            'customers' => User::query()->where('role', UserRole::Customer)->get()->map(fn (User $user) => [
                'email' => $user->email,
                'phone' => null,
                'vendor' => null,
            ]),
            default => User::query()->whereIn('role', [
                UserRole::SuperAdmin,
                UserRole::Accountant,
                UserRole::WarehouseStaff,
                UserRole::DeliveryStaff,
                UserRole::CustomerSupport,
            ])->get()->map(fn (User $user) => [
                'email' => $user->email,
                'phone' => null,
                'vendor' => null,
            ]),
        };
    }

    private function sendSms(?string $phone, string $body): bool
    {
        $url = config('services.sms.url');

        if (! MarketplaceSettings::enabled('notify_sms') || ! filled($url) || ! filled($phone)) {
            return false;
        }

        try {
            Http::timeout(5)->post($url, [
                'to' => $phone,
                'message' => $body,
                'sender' => config('services.sms.sender'),
            ]);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
