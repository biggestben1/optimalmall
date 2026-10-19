<?php

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

it('sends a vendor to the seller dashboard after login', function () {
    $user = User::factory()->create([
        'role' => UserRole::Vendor,
    ]);

    Vendor::factory()->create([
        'user_id' => $user->id,
        'name' => 'Lagos Gadget Hub',
    ]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('vendor.dashboard', absolute: false));

    $this->actingAs($user)
        ->get(route('vendor.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Vendor/Dashboard')
            ->where('shop.name', 'Lagos Gadget Hub')
        );
});

it('forbids customers from the seller dashboard', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('vendor.dashboard'))
        ->assertForbidden();
});
