<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('categories')->where('slug', 'health-and-wellness')->exists()) {
            return;
        }

        $sort = (int) DB::table('categories')->whereNull('parent_id')->max('sort_order');

        DB::table('categories')->insert([
            'name' => 'Health and wellness',
            'slug' => 'health-and-wellness',
            'icon' => 'health_and_safety',
            'sort_order' => $sort + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('categories')->where('slug', 'health-and-wellness')->delete();
    }
};
