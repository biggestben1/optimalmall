<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'vendor_id',
        'ledger_account_id',
        'type',
        'status',
        'currency',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class, 'ledger_account_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(WalletAdjustment::class);
    }

    public function balance(): float
    {
        return $this->account?->balance() ?? 0.0;
    }

    public function isFrozen(): bool
    {
        return $this->status === 'frozen';
    }
}
