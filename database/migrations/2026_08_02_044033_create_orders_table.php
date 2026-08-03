<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 30)->unique();
            $table->foreignId('customer_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->dateTime('order_date')->index();
            $table->enum('order_status', [
                'pending',
                'paid',
                'processed',
                'shipped',
                'completed',
                'cancelled',
            ])->default('pending')->index();
            $table->decimal('shipping_cost', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->string('shipping_city', 50);
            $table->string('notes', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
