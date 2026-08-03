<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EcommerceDatabaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_ecommerce_schema_and_dummy_data_are_seeded(): void
    {
        Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\EcommerceSeeder']);

        $this->assertSame(12, Customer::count());
        $this->assertSame(15, Product::count());
        $this->assertSame(25, Order::count());
        $this->assertSame(52, OrderItem::count());
        $this->assertTrue(Schema::hasColumns('customers', ['full_name', 'email', 'customer_status']));
        $this->assertTrue(Schema::hasColumns('products', ['product_name', 'category', 'price', 'stock', 'product_status']));
        $this->assertTrue(Schema::hasColumns('orders', ['invoice_number', 'customer_id', 'order_date', 'order_status']));
        $this->assertTrue(Schema::hasColumns('order_items', ['order_id', 'product_id', 'quantity', 'unit_price']));
    }

    public function test_ecommerce_relationships_work(): void
    {
        Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\EcommerceSeeder']);

        $order = Order::with('customer', 'items.product')->findOrFail(1);

        $this->assertSame('Andi Pratama', $order->customer->full_name);
        $this->assertCount(3, $order->items);
        $this->assertSame('Laptop Student 13', $order->products->first()->product_name);
    }
}
