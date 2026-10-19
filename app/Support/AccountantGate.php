<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;

class AccountantGate
{
    /**
     * @return array<string, string>
     */
    public static function actions(): array
    {
        return [
            'transactions.view' => 'Review wallet transactions',
            'transactions.export' => 'Export transactions',
            'reconcile' => 'Reconcile payments and bank statements',
            'expenses.record' => 'Record expenses',
            'expenses.approve' => 'Approve expenses',
            'payouts.review' => 'Review payout requests',
            'payouts.approve' => 'Approve payouts under the threshold',
            'payouts.execute' => 'Start a payout payment',
            'payouts.confirm' => 'Confirm a settled payout',
            'adjustments.prepare' => 'Prepare wallet adjustments',
            'adjustments.approve' => 'Approve wallet adjustments',
            'ledger.view' => 'View the general ledger',
            'reports.view' => 'View financial reports',
            'periods.close' => 'Close an accounting period',
            'wallets.freeze' => 'Freeze and unfreeze wallets',
        ];
    }

    /**
     * @return list<string>
     */
    public static function defaults(): array
    {
        return [
            'transactions.view',
            'transactions.export',
            'reconcile',
            'expenses.record',
            'payouts.review',
            'adjustments.prepare',
            'ledger.view',
            'reports.view',
        ];
    }

    /**
     * @return list<string>
     */
    public static function granted(): array
    {
        $stored = json_decode((string) MarketplaceSettings::get('accountant_permissions', ''), true);

        if (! is_array($stored)) {
            return self::defaults();
        }

        return array_values(array_intersect(array_keys(self::actions()), $stored));
    }

    public static function allows(?User $user, string $action): bool
    {
        if ($user === null) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->role === UserRole::Accountant && in_array($action, self::granted(), true);
    }

    public static function threshold(): float
    {
        return (float) MarketplaceSettings::get('payout_approval_threshold', 500000);
    }
}
