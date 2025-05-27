<?php

use App\Http\Controllers\AdmissionDataController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/passers', [AdmissionDataController::class, 'index'])->name('admissionPassers');
    Route::get('/import-passers', [AdmissionDataController::class, 'import']);

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
