<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\VendorStatus;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            ['name' => 'Lagos Gadget Hub', 'city' => 'Lagos', 'state' => 'Lagos'],
            ['name' => 'Abuja Official Store', 'city' => 'Abuja', 'state' => 'FCT'],
            ['name' => 'Naija Fashion House', 'city' => 'Ikeja', 'state' => 'Lagos'],
            ['name' => 'FreshMart Nigeria', 'city' => 'Port Harcourt', 'state' => 'Rivers'],
        ];

        foreach ($vendors as $index => $vendor) {
            $email = Str::slug($vendor['name']).'@vendors.optimalmall.ng';

            $user = User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => $vendor['name'],
                    'password' => 'password',
                    'role' => UserRole::Vendor,
                    'email_verified_at' => now(),
                ],
            );

            if (! $user->isVendor()) {
                $user->update(['role' => UserRole::Vendor]);
            }

            Vendor::query()->updateOrCreate(
                ['slug' => Str::slug($vendor['name'])],
                [
                    'user_id' => $user->id,
                    'name' => $vendor['name'],
                    'description' => $vendor['name'].' is a verified OptimalMall seller serving customers across Nigeria.',
                    'status' => VendorStatus::Active,
                    'city' => $vendor['city'],
                    'state' => $vendor['state'],
                    'phone' => '0803000000'.($index + 1),
                    'email' => $email,
                ],
            );
        }
    }
}
