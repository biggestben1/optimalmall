<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class MarketplaceSettings
{
    public const CACHE_KEY = 'marketplace.settings';

    /**
     * @return array<string, string|null>
     */
    public static function all(): array
    {
        if (! Schema::hasTable('settings')) {
            return [];
        }

        return Cache::remember(self::CACHE_KEY, 300, function () {
            return Setting::query()->pluck('value', 'key')->all();
        });
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $all = self::all();

        return array_key_exists($key, $all) && $all[$key] !== null && $all[$key] !== ''
            ? $all[$key]
            : $default;
    }

    public static function enabled(string $key, bool $default = false): bool
    {
        $value = self::get($key, $default ? '1' : '0');

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * @param  array<string, mixed>  $values
     */
    public static function put(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value === null ? null : (string) $value],
            );
        }

        Cache::forget(self::CACHE_KEY);
        self::apply();
    }

    public static function apply(): void
    {
        if (! Schema::hasTable('settings')) {
            return;
        }

        $rate = self::get('commission_rate');

        if ($rate !== null) {
            config(['marketplace.commission_rate' => (float) $rate]);
        }

        if (self::get('require_product_approval') !== null) {
            config(['marketplace.require_product_approval' => self::enabled('require_product_approval')]);
        }
    }
}
