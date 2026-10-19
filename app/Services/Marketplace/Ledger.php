<?php

namespace App\Services\Marketplace;

use App\Models\Vendor;
use App\Services\Vendor\Earnings;

class Ledger
{
    /**
     * Marketplace cash, commission, and vendor funds owed.
     * Uses the same earnings rules as the seller portal.
     *
     * @return array{gross: float, commission: float, refunds: float, vendor_net: float, vendor_available: float, reserved: float}
     */
    public function snapshot(): array
    {
        $totals = [
            'gross' => 0.0,
            'commission' => 0.0,
            'refunds' => 0.0,
            'vendor_net' => 0.0,
            'vendor_available' => 0.0,
            'reserved' => 0.0,
        ];

        Vendor::query()->orderBy('id')->each(function (Vendor $vendor) use (&$totals): void {
            $summary = (new Earnings($vendor))->summary();
            $totals['gross'] += $summary['gross'];
            $totals['commission'] += $summary['commission'];
            $totals['refunds'] += $summary['refunds'];
            $totals['vendor_net'] += $summary['net'];
            $totals['vendor_available'] += $summary['available'];
            $totals['reserved'] += $summary['reserved'];
        });

        return array_map(fn (float $amount) => round($amount, 2), $totals);
    }
}
