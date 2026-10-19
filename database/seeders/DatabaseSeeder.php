<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@optimalmall.ng'],
            [
                'name' => 'OptimalMall Admin',
                'password' => 'password',
                'role' => UserRole::SuperAdmin,
                'email_verified_at' => now(),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'customer@optimalmall.ng'],
            [
                'name' => 'Emeka Customer',
                'password' => 'password',
                'role' => UserRole::Customer,
                'email_verified_at' => now(),
            ],
        );

        $this->call([
            CategorySeeder::class,
            VendorSeeder::class,
            ProductSeeder::class,
            BannerSeeder::class,
            CommerceSeeder::class,
        ]);
    }
}
