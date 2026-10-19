<?php

namespace App\Services\Vendor;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    /**
     * @param  array<string, mixed>  $properties
     */
    public static function record(string $action, ?Model $auditable = null, array $properties = [], ?Vendor $vendor = null, ?User $user = null): void
    {
        $actor = $user ?? auth()->user();

        AuditLog::query()->create([
            'user_id' => $actor?->id,
            'vendor_id' => $vendor?->id ?? $actor?->vendor?->id,
            'action' => $action,
            'auditable_type' => $auditable ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'properties' => $properties,
            'ip_address' => request()->ip(),
        ]);
    }
}
