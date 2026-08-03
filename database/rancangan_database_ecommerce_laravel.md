# Rancangan Database E-Commerce

## Relasi Tabel

```text
customers
    │
    │ one-to-many
    ▼
orders
    │
    │ one-to-many
    ▼
order_items
    ▲
    │ many-to-one
    │
products
```

## Tabel `customers`

```php
Schema::create('customers', function (Blueprint $table) {
    $table->id();
    $table->string('full_name', 100);
    $table->string('email', 150)->unique();
    $table->string('phone', 20)->nullable();
    $table->string('city', 50)->index();
    $table->enum('customer_status', [
        'active',
        'inactive',
    ])->default('active');
    $table->timestamps();
});
```

## Tabel `products`

```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('product_name', 150);
    $table->string('category', 50)->index();
    $table->decimal('price', 12, 2);
    $table->unsignedInteger('stock')->default(0);
    $table->enum('product_status', [
        'active',
        'inactive',
    ])->default('active');
    $table->timestamps();
});
```

## Tabel `orders`

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();

    $table->string('invoice_number', 30)->unique();

    $table->foreignId('customer_id')
        ->constrained('customers')
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
```

## Tabel `order_items`

```php
Schema::create('order_items', function (Blueprint $table) {
    $table->id();

    $table->foreignId('order_id')
        ->constrained('orders')
        ->cascadeOnUpdate()
        ->cascadeOnDelete();

    $table->foreignId('product_id')
        ->constrained('products')
        ->cascadeOnUpdate()
        ->restrictOnDelete();

    $table->unsignedInteger('quantity');
    $table->decimal('unit_price', 12, 2);
    $table->timestamps();

    $table->unique(
        ['order_id', 'product_id'],
        'order_items_order_product_unique'
    );
});
```

## Ringkasan Kolom

### `customers`

| Kolom | Tipe Laravel | Ketentuan |
|---|---|---|
| `id` | `$table->id()` | Primary key |
| `full_name` | `$table->string(..., 100)` | Wajib |
| `email` | `$table->string(..., 150)` | Wajib dan unik |
| `phone` | `$table->string(..., 20)` | Opsional |
| `city` | `$table->string(..., 50)` | Wajib dan memiliki index |
| `customer_status` | `$table->enum()` | `active` atau `inactive` |
| `created_at` | `$table->timestamps()` | Dibuat otomatis |
| `updated_at` | `$table->timestamps()` | Dibuat otomatis |

### `products`

| Kolom | Tipe Laravel | Ketentuan |
|---|---|---|
| `id` | `$table->id()` | Primary key |
| `product_name` | `$table->string(..., 150)` | Wajib |
| `category` | `$table->string(..., 50)` | Wajib dan memiliki index |
| `price` | `$table->decimal(12, 2)` | Wajib |
| `stock` | `$table->unsignedInteger()` | Default `0` |
| `product_status` | `$table->enum()` | `active` atau `inactive` |
| `created_at` | `$table->timestamps()` | Dibuat otomatis |
| `updated_at` | `$table->timestamps()` | Dibuat otomatis |

### `orders`

| Kolom | Tipe Laravel | Ketentuan |
|---|---|---|
| `id` | `$table->id()` | Primary key |
| `invoice_number` | `$table->string(..., 30)` | Wajib dan unik |
| `customer_id` | `$table->foreignId()` | Foreign key ke `customers.id` |
| `order_date` | `$table->dateTime()` | Wajib dan memiliki index |
| `order_status` | `$table->enum()` | Status pesanan |
| `shipping_cost` | `$table->decimal(12, 2)` | Default `0` |
| `discount` | `$table->decimal(12, 2)` | Default `0` |
| `shipping_city` | `$table->string(..., 50)` | Wajib |
| `notes` | `$table->string(..., 255)` | Opsional |
| `created_at` | `$table->timestamps()` | Dibuat otomatis |
| `updated_at` | `$table->timestamps()` | Dibuat otomatis |

### `order_items`

| Kolom | Tipe Laravel | Ketentuan |
|---|---|---|
| `id` | `$table->id()` | Primary key |
| `order_id` | `$table->foreignId()` | Foreign key ke `orders.id` |
| `product_id` | `$table->foreignId()` | Foreign key ke `products.id` |
| `quantity` | `$table->unsignedInteger()` | Wajib |
| `unit_price` | `$table->decimal(12, 2)` | Harga produk saat dipesan |
| `created_at` | `$table->timestamps()` | Dibuat otomatis |
| `updated_at` | `$table->timestamps()` | Dibuat otomatis |

## Ketentuan Relasi

| Relasi | Tipe |
|---|---|
| `customers` ke `orders` | One-to-many |
| `orders` ke `order_items` | One-to-many |
| `products` ke `order_items` | One-to-many |
| `orders` ke `products` | Many-to-many melalui `order_items` |
