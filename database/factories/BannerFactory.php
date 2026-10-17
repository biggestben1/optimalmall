<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'subtitle' => fake()->sentence(6),
            'image_path' => 'https://picsum.photos/seed/'.fake()->unique()->uuid().'/1200/500',
            'link_url' => '/products',
            'cta_label' => 'Shop now',
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
