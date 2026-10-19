<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;

class AdminAccess
{
    /**
     * @return array<string, string>
     */
    public static function modules(): array
    {
        return [
            'dashboard' => 'Dashboard',
            'vendors' => 'Sellers',
            'customers' => 'Customers',
            'staff' => 'Staff & roles',
            'catalogue' => 'Catalogue',
            'orders' => 'Orders',
            'inventory' => 'Inventory & shipping',
            'finance' => 'Finance',
            'promotions' => 'Promotions',
            'content' => 'Content',
            'support' => 'Support',
            'reports' => 'Reports',
            'notifications' => 'Notifications',
            'settings' => 'Settings',
            'audit' => 'Audit logs',
        ];
    }

    /**
     * @return list<string>
     */
    public static function modulesFor(?User $user): array
    {
        if ($user === null || $user->role === null) {
            return [];
        }

        if ($user->isSuperAdmin()) {
            return array_keys(self::modules());
        }

        return self::grants()[$user->role->value] ?? [];
    }

    public static function isStaff(?User $user): bool
    {
        return $user !== null && self::modulesFor($user) !== [];
    }

    public static function allows(?User $user, string $module): bool
    {
        return in_array($module, self::modulesFor($user), true);
    }

    /**
     * @return array<string, list<string>>
     */
    public static function grants(): array
    {
        $all = array_keys(self::modules());

        return [
            UserRole::SuperAdmin->value => $all,
            UserRole::Accountant->value => ['dashboard', 'finance', 'reports', 'audit'],
            UserRole::WarehouseStaff->value => ['dashboard', 'catalogue', 'orders', 'inventory'],
            UserRole::DeliveryStaff->value => ['dashboard', 'orders', 'inventory'],
            UserRole::CustomerSupport->value => ['dashboard', 'customers', 'orders', 'support', 'notifications'],
        ];
    }
}
