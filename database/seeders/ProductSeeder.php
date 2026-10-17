<?php

namespace Database\Seeders;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = Vendor::query()->where('status', 'active')->get();
        $categories = Category::query()->whereNotNull('parent_id')->get();

        if ($vendors->isEmpty() || $categories->isEmpty()) {
            return;
        }

        $catalog = [
            ['title' => 'Samsung Galaxy A55 5G 256GB', 'price' => 485000, 'featured' => true, 'trending' => true],
            ['title' => 'iPhone 15 128GB Midnight', 'price' => 1250000, 'featured' => true, 'best' => true],
            ['title' => 'Tecno Camon 30 Premier', 'price' => 320000, 'trending' => true],
            ['title' => 'HP Pavilion 15 Intel Core i7', 'price' => 890000, 'featured' => true],
            ['title' => 'Apple MacBook Air M3 13"', 'price' => 1850000, 'best' => true],
            ['title' => 'Hisense 55" UHD Smart TV', 'price' => 410000, 'trending' => true],
            ['title' => 'Oraimo FreePods 4 ANC', 'price' => 45000, 'best' => true],
            ['title' => 'Men Ankara Casual Shirt', 'price' => 18500, 'trending' => true],
            ['title' => 'Women Ankara Midi Dress', 'price' => 24500, 'featured' => true],
            ['title' => 'Peak Milk Full Cream 900g', 'price' => 7200],
            ['title' => 'Indomie Chicken Flavour Carton', 'price' => 9800, 'best' => true],
            ['title' => 'Nexus Dual Burner Gas Cooker', 'price' => 78000, 'featured' => true],
        ];

        foreach ($catalog as $index => $item) {
            $product = Product::query()->create([
                'vendor_id' => $vendors[$index % $vendors->count()]->id,
                'category_id' => $categories[$index % $categories->count()]->id,
                'title' => $item['title'],
                'slug' => Str::slug($item['title']).'-'.($index + 1),
                'description' => $item['title'].' available on OptimalMall with escrow protection and nationwide delivery options.',
                'price' => $item['price'],
                'compare_at_price' => $item['price'] * 1.15,
                'stock' => fake()->numberBetween(5, 80),
                'sku' => 'OM-'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT),
                'status' => ProductStatus::Active,
                'is_featured' => (bool) ($item['featured'] ?? false),
                'is_trending' => (bool) ($item['trending'] ?? false),
                'is_best_seller' => (bool) ($item['best'] ?? false),
            ]);

            ProductImage::query()->create([
                'product_id' => $product->id,
                'path' => 'https://picsum.photos/seed/optimalmall'.($index + 1).'/640/640',
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }
    }
}
