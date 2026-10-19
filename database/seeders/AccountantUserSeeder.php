<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountantUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'accountant@optimalmall.ng'],
            [
                'name' => 'OptimalMall Accountant',
                'password' => 'password',
                'role' => UserRole::Accountant,
                'email_verified_at' => now(),
            ],
        );
    }
}
