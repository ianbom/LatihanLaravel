<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [ProductController::class, 'dashboard'])->name('dashboard');
    Route::get('list-product', [ProductController::class, 'index'])->name('list-product');
    Route::post('store-product', [ProductController::class, 'store'])->name('store-product');
});

require __DIR__.'/settings.php';
