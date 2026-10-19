<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountingPeriod extends Model
{
    protected $fillable = [
        'label',
        'starts_on',
        'ends_on',
        'status',
        'has_differences',
        'snapshot',
        'notes',
        'closed_by',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
            'has_differences' => 'boolean',
            'snapshot' => 'array',
            'closed_at' => 'datetime',
        ];
    }

    public function closer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }
}
