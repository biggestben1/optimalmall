<?php

namespace App\Models;

use App\Enums\VendorStatus;
use Database\Factories\VendorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    /** @use HasFactory<VendorFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'business_name',
        'registration_number',
        'slug',
        'description',
        'logo_path',
        'status',
        'city',
        'state',
        'address',
        'phone',
        'email',
        'commission_rate',
    ];

    protected function casts(): array
    {
        return [
            'status' => VendorStatus::class,
            'commission_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(VendorBankAccount::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(VendorNotification::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function notifyPortal(string $title, string $body): VendorNotification
    {
        return $this->notifications()->create([
            'title' => $title,
            'body' => $body,
        ]);
    }

    public function isActive(): bool
    {
        return $this->status === VendorStatus::Active;
    }
}
