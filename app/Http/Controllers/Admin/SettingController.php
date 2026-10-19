<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Post;
use App\Models\Setting;
use App\Services\Vendor\AuditLogger;
use App\Support\MarketplaceSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Settings/Edit', [
            'settings' => [
                'store_name' => (string) MarketplaceSettings::get('store_name', 'OptimalMall'),
                'support_email' => (string) MarketplaceSettings::get('support_email', 'admin@optimalconsult.org'),
                'seo_title' => (string) MarketplaceSettings::get('seo_title', 'Shop Smart. Live Better.'),
                'seo_description' => (string) MarketplaceSettings::get('seo_description', ''),
                'require_product_approval' => MarketplaceSettings::enabled('require_product_approval', (bool) config('marketplace.require_product_approval')),
                'two_factor_required' => MarketplaceSettings::enabled('two_factor_required'),
                'low_stock_threshold' => (int) MarketplaceSettings::get('low_stock_threshold', 5),
                'payment_provider' => (string) MarketplaceSettings::get('payment_provider', 'manual'),
                'funding_bank' => (string) MarketplaceSettings::get('funding_bank', ''),
                'funding_account_name' => (string) MarketplaceSettings::get('funding_account_name', ''),
                'funding_account_number' => (string) MarketplaceSettings::get('funding_account_number', ''),
                'funding_bank' => (string) MarketplaceSettings::get('funding_bank', ''),
                'funding_account_name' => (string) MarketplaceSettings::get('funding_account_name', ''),
                'funding_account_number' => (string) MarketplaceSettings::get('funding_account_number', ''),
                'notify_email' => MarketplaceSettings::enabled('notify_email', true),
                'notify_sms' => MarketplaceSettings::enabled('notify_sms'),
                'last_backup_at' => MarketplaceSettings::get('last_backup_at'),
            ],
            'integrations' => [
                'webhook_secret' => filled(config('services.payments.webhook_secret')),
                'sms_gateway' => filled(config('services.sms.url')),
                'mailer' => (string) config('mail.default'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'store_name' => ['required', 'string', 'max:120'],
            'support_email' => ['required', 'email', 'max:255'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:300'],
            'require_product_approval' => ['required', 'boolean'],
            'two_factor_required' => ['required', 'boolean'],
            'low_stock_threshold' => ['required', 'integer', 'min:0', 'max:1000'],
            'payment_provider' => ['required', Rule::in(['manual', 'paystack', 'flutterwave'])],
            'funding_bank' => ['nullable', 'string', 'max:80'],
            'funding_account_name' => ['nullable', 'string', 'max:120'],
            'funding_account_number' => ['nullable', 'string', 'max:20'],
            'funding_bank' => ['nullable', 'string', 'max:80'],
            'funding_account_name' => ['nullable', 'string', 'max:120'],
            'funding_account_number' => ['nullable', 'string', 'max:30'],
            'notify_email' => ['required', 'boolean'],
            'notify_sms' => ['required', 'boolean'],
        ]);

        MarketplaceSettings::put($data);
        AuditLogger::record('settings.updated', null, [
            'payment_provider' => $data['payment_provider'],
            'two_factor_required' => (bool) $data['two_factor_required'],
            'require_product_approval' => (bool) $data['require_product_approval'],
        ]);

        return back()->with('status', 'Settings saved. Payment secrets stay in the server environment and are not stored here.');
    }

    public function backup(): RedirectResponse
    {
        $payload = [
            'exported_at' => now()->toIso8601String(),
            'settings' => Setting::query()->get(['key', 'value']),
            'pages' => Page::query()->get(),
            'posts' => Post::query()->get(),
        ];
        $name = 'marketplace-'.now()->format('Ymd-His').'.json';
        Storage::disk('local')->put('backups/'.$name, json_encode($payload, JSON_PRETTY_PRINT));
        MarketplaceSettings::put([
            'last_backup_at' => now()->toDateTimeString(),
            'last_backup_file' => $name,
        ]);
        AuditLogger::record('backup.exported', null, ['file' => $name]);

        return back()->with('status', 'Configuration backup saved on the server.');
    }

    public function downloadBackup(): StreamedResponse
    {
        $name = basename((string) MarketplaceSettings::get('last_backup_file', ''));
        abort_unless($name !== '' && Storage::disk('local')->exists('backups/'.$name), 404);

        return Storage::disk('local')->download('backups/'.$name);
    }
}
