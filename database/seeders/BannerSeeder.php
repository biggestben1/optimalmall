<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title' => 'SUPER MEGA MALL DAYS',
                'subtitle' => 'Up to 40% off phones, fashion and home essentials across Nigeria.',
                'cta_label' => 'Shop flash deals',
                'link_url' => '/products?sort=featured',
                'sort_order' => 0,
            ],
            [
                'title' => 'Express 24h Lagos Dispatch',
                'subtitle' => 'Order before 2 PM for same-day dispatch in Lekki & Ikeja.',
                'cta_label' => 'Browse electronics',
                'link_url' => '/products',
                'sort_order' => 1,
            ],
        ];

        foreach ($banners as $index => $banner) {
            Banner::query()->create([
                ...$banner,
                'image_path' => 'https://picsum.photos/seed/ombanner'.($index + 1).'/1400/560',
                'is_active' => true,
            ]);
        }
    }
}
