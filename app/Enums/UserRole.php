<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Customer = 'customer';
    case Vendor = 'vendor';
    case Accountant = 'accountant';
    case WarehouseStaff = 'warehouse_staff';
    case DeliveryStaff = 'delivery_staff';
    case CustomerSupport = 'customer_support';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::Customer => 'Customer',
            self::Vendor => 'Vendor',
            self::Accountant => 'Accountant',
            self::WarehouseStaff => 'Warehouse Staff',
            self::DeliveryStaff => 'Delivery Staff',
            self::CustomerSupport => 'Customer Support',
        };
    }
}
