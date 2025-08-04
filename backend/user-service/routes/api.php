<?php

use App\Infrastructure\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('/login', 'login');
});