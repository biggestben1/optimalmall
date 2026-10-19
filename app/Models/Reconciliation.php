<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reconciliation extends Model
{
    protected $fillable = [
        'reference',
        'source',
        'period_start',
        'period_end',
        'expected_amount',
        'statement_amount',
        'difference',
        'status',
        'notes',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'expected_amount' => 'decimal:2',
            'statement_amount' => 'decimal:2',
            'difference' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
