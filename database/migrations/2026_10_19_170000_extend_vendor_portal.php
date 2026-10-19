<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('business_name')->nullable()->after('name');
            $table->string('registration_number')->nullable()->after('business_name');
            $table->string('address')->nullable()->after('state');
            $table->decimal('commission_rate', 5, 2)->nullable()->after('email');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('approval_status')->default('approved')->after('status');
            $table->index('approval_status');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->text('shipping_address')->nullable()->after('customer_email');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('fulfilment_status')->default('pending')->after('line_total');
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->decimal('commission_rate', 5, 2)->nullable();
            $table->decimal('commission_amount', 12, 2)->nullable();
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->foreignId('vendor_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::table('advertisements', function (Blueprint $table) {
            $table->foreignId('vendor_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->text('vendor_reply')->nullable()->after('body');
        });

        Schema::create('vendor_bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('account_number');
            $table->boolean('is_primary')->default(true);
            $table->timestamps();
        });

        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_bank_account_id')->nullable()->constrained('vendor_bank_accounts')->nullOnDelete();
            $table->string('reference')->unique();
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('requested');
            $table->string('note')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['vendor_id', 'status']);
        });

        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('subject');
            $table->string('status')->default('open');
            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->timestamps();
        });

        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            $table->timestamps();
        });

        Schema::create('vendor_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['vendor_id', 'read_at']);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['auditable_type', 'auditable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('vendor_notifications');
        Schema::dropIfExists('ticket_messages');
        Schema::dropIfExists('support_tickets');
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('vendor_bank_accounts');

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn('vendor_reply');
        });

        Schema::table('advertisements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vendor_id');
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vendor_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'fulfilment_status',
                'carrier',
                'tracking_number',
                'shipped_at',
                'delivered_at',
                'commission_rate',
                'commission_amount',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('shipping_address');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['approval_status']);
            $table->dropColumn('approval_status');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['business_name', 'registration_number', 'address', 'commission_rate']);
        });
    }
};
