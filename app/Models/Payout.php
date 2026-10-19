<?php

namespace App\Models;

use App\Enums\PayoutStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    protected $fillable = [
        'vendor_id',
        'vendor_bank_account_id',
        'reference',
        'amount',
        'status',
        'note',
        'rejection_reason',
        'approved_by',
        'approved_at',
        'initiated_by',
        'initiated_at',
        'confirmed_by',
        'provider_reference',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => PayoutStatus::class,
            'approved_at' => 'datetime',
            'initiated_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(VendorBankAccount::class, 'vendor_bank_account_id');
    }
}
