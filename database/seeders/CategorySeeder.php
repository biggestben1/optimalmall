<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Phones & Tablets', 'icon' => 'phone_iphone', 'children' => ['Apple iPhones', 'Samsung Galaxy', 'Tecno & Infinix', 'Tablets']],
            ['name' => 'Computing & Laptops', 'icon' => 'laptop_mac', 'children' => ['Laptops', 'Desktops', 'Storage', 'Accessories']],
            ['name' => 'Electronics & Audio', 'icon' => 'tv', 'children' => ['TVs', 'Audio', 'Cameras', 'Smart Home']],
            ['name' => 'Fashion & Beauty', 'icon' => 'checkroom', 'children' => ['Men', 'Women', 'Kids', 'Beauty']],
            ['name' => 'Supermarket & Groceries', 'icon' => 'shopping_basket', 'children' => ['Food Cupboard', 'Drinks', 'Household']],
            ['name' => 'Home & Living', 'icon' => 'home', 'children' => ['Furniture', 'Kitchen', 'Decor']],
        ];

        foreach ($categories as $index => $data) {
            $parent = Category::query()->create([
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'icon' => $data['icon'],
                'sort_order' => $index,
                'is_active' => true,
            ]);

            foreach ($data['children'] as $childIndex => $childName) {
                Category::query()->create([
                    'parent_id' => $parent->id,
                    'name' => $childName,
                    'slug' => Str::slug($parent->slug.'-'.$childName),
                    'icon' => $data['icon'],
                    'sort_order' => $childIndex,
                    'is_active' => true,
                ]);
            }
        }
    }
}
