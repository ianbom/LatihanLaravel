<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'invoice_number',
    'customer_id',
    'order_date',
    'order_status',
    'shipping_cost',
    'discount',
    'shipping_city',
    'notes',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'order_date' => 'datetime',
            'shipping_cost' => 'decimal:2',
            'discount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return BelongsToMany<Product, $this> */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot(['quantity', 'unit_price'])
            ->withTimestamps();
    }
}
