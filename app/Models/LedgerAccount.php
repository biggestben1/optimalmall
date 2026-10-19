<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LedgerAccount extends Model
{
    protected $fillable = [
        'code',
        'name',
        'type',
        'owner_type',
        'owner_id',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'owner_id' => 'integer',
        ];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }

    public function balance(): float
    {
        $debit = round((float) $this->lines()->sum('debit'), 2);
        $credit = round((float) $this->lines()->sum('credit'), 2);

        return in_array($this->type, ['asset', 'expense'], true)
            ? round($debit - $credit, 2)
            : round($credit - $debit, 2);
    }
}
