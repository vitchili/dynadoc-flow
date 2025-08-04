<?php

use App\Infrastructure\Http\Controllers\ContextController;
use App\Infrastructure\Http\Controllers\SectionController;
use App\Infrastructure\Http\Controllers\TagController;
use App\Infrastructure\Http\Controllers\TemplateController;
use App\Infrastructure\Http\Middlewares\JwtAuthMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(JwtAuthMiddleware::class)->group(function () {
    Route::prefix('contexts')->controller(ContextController::class)->group(function () {
        Route::get('/filters', 'findByFilters');
        Route::post('/', 'store');
        Route::patch('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
    });

    Route::prefix('tags')->controller(TagController::class)->group(function () {
        Route::get('/filters', 'findByFilters');
        Route::post('/', 'store');
        Route::patch('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        // TODO - listar json de tags cadastradas.
    });

    Route::prefix('templates')->controller(TemplateController::class)->group(function () {
        Route::get('/filters', 'findByFilters');
        Route::post('/', 'store');
        Route::patch('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        //TODO - Download Template Route::post('/download', 'download');
    });

    Route::prefix('sections')->controller(SectionController::class)->group(function () {
        Route::get('/filters', 'findByFilters');
        Route::post('/', 'store');
        Route::patch('/{id}', 'update');
        Route::delete('/{id}', 'destroy');
        //TODO - Import Section Route::post('/import/{id}', 'import');
    });
});