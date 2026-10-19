<?php

namespace App\Enums;

enum PayoutStatus: string
{
    case Requested = 'requested';
    case Approved = 'approved';
    case Processing = 'processing';
    case Paid = 'paid';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Requested => 'Requested',
            self::Approved => 'Approved',
            self::Processing => 'Payment started',
            self::Paid => 'Paid',
            self::Rejected => 'Rejected',
        };
    }
}
