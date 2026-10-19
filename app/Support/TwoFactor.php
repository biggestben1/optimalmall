<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TwoFactor
{
    public static function enabled(User $user): bool
    {
        return $user->two_factor_confirmed_at !== null && filled($user->two_factor_secret);
    }

    public static function requiredFor(User $user): bool
    {
        if (! MarketplaceSettings::enabled('two_factor_required')) {
            return false;
        }

        return in_array($user->role, [UserRole::SuperAdmin, UserRole::Accountant], true);
    }

    public static function mustEnroll(User $user): bool
    {
        return self::requiredFor($user) && ! self::enabled($user);
    }

    /**
     * @return list<string>
     */
    public static function recoveryCodes(): array
    {
        return collect(range(1, 8))
            ->map(fn () => Str::upper(Str::random(10)))
            ->all();
    }

    /**
     * @param  list<string>  $codes
     * @return list<string>
     */
    public static function hashCodes(array $codes): array
    {
        return array_map(fn (string $code) => Hash::make($code), $codes);
    }

    public static function consumeRecoveryCode(User $user, string $code): bool
    {
        $code = strtoupper(preg_replace('/\s+/', '', $code) ?? '');
        $hashes = $user->two_factor_recovery_codes ?? [];

        foreach ($hashes as $index => $hash) {
            if (Hash::check($code, $hash)) {
                unset($hashes[$index]);
                $user->forceFill([
                    'two_factor_recovery_codes' => array_values($hashes),
                ])->save();

                return true;
            }
        }

        return false;
    }
}
