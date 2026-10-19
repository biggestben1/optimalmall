<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDispatch extends Model
{
    protected $fillable = [
        'user_id',
        'audience',
        'channels',
        'subject',
        'body',
        'recipients',
        'sent',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'recipients' => 'integer',
            'sent' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
