<?php

namespace Database\Factories;

use App\Enums\VendorStatus;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('##'),
            'description' => fake()->paragraph(),
            'logo_path' => null,
            'status' => VendorStatus::Active,
            'city' => fake()->randomElement(['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']),
            'state' => fake()->randomElement(['Lagos', 'FCT', 'Rivers', 'Oyo']),
            'phone' => '080'.fake()->numerify('########'),
            'email' => fake()->unique()->companyEmail(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => VendorStatus::Pending,
        ]);
    }
}
