<?php

namespace Database\Seeders;

use App\Enums\VendorStatus;
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

        foreach ($vendors as $vendor) {
            Vendor::query()->create([
                'name' => $vendor['name'],
                'slug' => Str::slug($vendor['name']),
                'description' => $vendor['name'].' is a verified OptimalMall seller serving customers across Nigeria.',
                'status' => VendorStatus::Active,
                'city' => $vendor['city'],
                'state' => $vendor['state'],
                'phone' => '080'.fake()->numerify('########'),
                'email' => Str::slug($vendor['name']).'@vendors.optimalmall.ng',
            ]);
        }
    }
}
