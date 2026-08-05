<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

#[Fillable(['full_name', 'email', 'phone', 'city', 'customer_status'])]
class Customer extends Model
{
    /** @return HasMany<Order, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function items(): HasManyThrough
    {
        return $this->hasManyThrough(
            OrderItem::class,
            Order::class,
            'customer_id', 
            'order_id',    
            'id',         
            'id'           
        );
    }
}
