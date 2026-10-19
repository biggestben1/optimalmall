<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
        });

        DB::statement('ALTER TABLE payments MODIFY order_id BIGINT UNSIGNED NULL');

        Schema::table('payments', function (Blueprint $table) {
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
        });

        Schema::table('payouts', function (Blueprint $table) {
            $table->foreignId('approved_by')->nullable()->after('rejection_reason')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->foreignId('initiated_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            $table->timestamp('initiated_at')->nullable()->after('initiated_by');
            $table->foreignId('confirmed_by')->nullable()->after('initiated_at')->constrained('users')->nullOnDelete();
            $table->string('provider_reference')->nullable()->after('confirmed_by');
        });

        Schema::create('ledger_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type');
            $table->string('owner_type')->nullable();
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
            $table->unique(['owner_type', 'owner_id', 'code']);
        });

        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('idempotency_key')->unique();
            $table->string('description');
            $table->timestamp('posted_at');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source_type')->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->foreignId('reverses_entry_id')->nullable()->constrained('journal_entries')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('journal_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ledger_account_id')->constrained()->restrictOnDelete();
            $table->decimal('debit', 14, 2)->default(0);
            $table->decimal('credit', 14, 2)->default(0);
            $table->string('memo')->nullable();
            $table->timestamps();
        });

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('ledger_account_id')->constrained()->restrictOnDelete();
            $table->string('type');
            $table->string('status')->default('active');
            $table->string('currency', 3)->default('NGN');
            $table->timestamps();
            $table->unique('user_id');
            $table->unique('vendor_id');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('journal_entry_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference');
            $table->string('idempotency_key')->unique();
            $table->string('type');
            $table->string('direction');
            $table->decimal('amount', 14, 2);
            $table->decimal('balance_after', 14, 2)->nullable();
            $table->string('status')->default('posted');
            $table->boolean('suspicious')->default(false);
            $table->string('description');
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->index(['wallet_id', 'status']);
            $table->index('reference');
        });

        Schema::create('wallet_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('direction');
            $table->decimal('amount', 14, 2);
            $table->string('reason');
            $table->string('status')->default('pending');
            $table->foreignId('prepared_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('journal_entry_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->decimal('amount', 14, 2);
            $table->date('spent_on');
            $table->string('description');
            $table->string('attachment_path')->nullable();
            $table->string('status')->default('submitted');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('journal_entry_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('reconciliations', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('source');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('expected_amount', 14, 2);
            $table->decimal('statement_amount', 14, 2);
            $table->decimal('difference', 14, 2);
            $table->string('status');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('accounting_periods', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->string('status')->default('open');
            $table->boolean('has_differences')->default(false);
            $table->json('snapshot')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounting_periods');
        Schema::dropIfExists('reconciliations');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('wallet_adjustments');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('journal_lines');
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('ledger_accounts');

        Schema::table('payouts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn('approved_at');
            $table->dropConstrainedForeignId('initiated_by');
            $table->dropColumn('initiated_at');
            $table->dropConstrainedForeignId('confirmed_by');
            $table->dropColumn('provider_reference');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
        });
        DB::statement('ALTER TABLE payments MODIFY order_id BIGINT UNSIGNED NOT NULL');
        Schema::table('payments', function (Blueprint $table) {
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
        });
    }
};
