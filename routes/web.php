<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
Route::inertia('register', 'auth/register')->name('register');

Route::middleware('auth.dashboard')->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('records', 'records')->name('records.index');

    Route::prefix('internal-api')->name('internal.')->group(function () {
        Route::get('records', [RecordController::class, 'index'])->name('records.index');
        Route::post('records', [RecordController::class, 'store'])->name('records.store');
        Route::delete('records/{id}', [RecordController::class, 'destroy'])
            ->whereNumber('id')->name('records.destroy');
        Route::post('seed', [RecordController::class, 'seed'])->name('seed');
        Route::get('stats', [StatsController::class, 'show'])->name('stats');
    });

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
