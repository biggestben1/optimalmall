<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);
        $price = fake()->randomFloat(2, 2500, 850000);

        return [
            'vendor_id' => Vendor::factory(),
            'category_id' => Category::factory(),
            'title' => ucwords($title),
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('####'),
            'description' => fake()->paragraphs(3, true),
            'price' => $price,
            'compare_at_price' => fake()->boolean(40) ? $price * 1.2 : null,
            'stock' => fake()->numberBetween(0, 120),
            'sku' => strtoupper(fake()->bothify('OM-???-####')),
            'status' => ProductStatus::Active,
            'is_featured' => fake()->boolean(25),
            'is_trending' => fake()->boolean(25),
            'is_best_seller' => fake()->boolean(20),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProductStatus::Draft,
        ]);
    }
}
