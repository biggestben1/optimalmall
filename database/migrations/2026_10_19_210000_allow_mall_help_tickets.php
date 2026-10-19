<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropForeign(['vendor_id']);
        });

        DB::statement('ALTER TABLE support_tickets MODIFY vendor_id BIGINT UNSIGNED NULL');

        Schema::table('support_tickets', function (Blueprint $table) {
            $table->foreign('vendor_id')->references('id')->on('vendors')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropForeign(['vendor_id']);
        });

        DB::statement('ALTER TABLE support_tickets MODIFY vendor_id BIGINT UNSIGNED NOT NULL');

        Schema::table('support_tickets', function (Blueprint $table) {
            $table->foreign('vendor_id')->references('id')->on('vendors')->cascadeOnDelete();
        });
    }
};
