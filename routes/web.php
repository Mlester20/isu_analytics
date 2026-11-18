<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RolesController;
use App\Http\Controllers\Admin\ImportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlaceholderController;
use Illuminate\Support\Facades\Route;

// The root route: guests go straight to login, logged-in users go to their
// role's landing page (students have their own grades page instead).
Route::get('/', function () {
    $user = auth()->user();

    if (! $user) {
        return redirect()->route('login');
    }

    if ($user->hasRole('student') && ! $user->hasAnyRole(['admin', 'chair', 'faculty'])) {
        return redirect()->route('grades.own');
    }

    return redirect()->route('dashboard');
})->name('home');

// Step 6 — protected placeholders for the future feature pages.
// Each is gated by the matching Spatie permission.
Route::middleware(['auth', 'verified', 'permission:dashboard.view'])
    ->get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');

// Import routes
Route::middleware(['auth', 'verified', 'permission:import.view'])
    ->get('/import', [ImportController::class, 'index'])
    ->name('import.index');

Route::middleware(['auth', 'verified', 'permission:import.upload'])
    ->group(function () {
        Route::post('/import/preview', [ImportController::class, 'preview'])->name('import.preview');
        Route::post('/import', [ImportController::class, 'store'])->name('import.store');
    });

Route::middleware(['auth', 'verified', 'permission:risk.view'])
    ->get('/risk', [PlaceholderController::class, 'risk'])
    ->name('risk.index');

// Students only: their own grades page (login redirect target).
Route::middleware(['auth', 'verified', 'permission:grades.view-own'])
    ->get('/my-grades', [PlaceholderController::class, 'myGrades'])
    ->name('grades.own');

// Step 5 — admin user management, gated by the users.manage permission
// (only the admin role holds it, so role:admin and permission:users.manage
// are equivalent here; permission is used so extra roles can be granted it later).
Route::middleware(['auth', 'verified', 'permission:users.manage'])
    ->prefix('admin')
    ->name('admin.users.')
    ->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('index');
        Route::post('/users', [UserController::class, 'store'])->name('store');
        Route::patch('/users/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('destroy');
    });

// Role management: separate permission so it can be delegated on its own.
// The admin role is locked in the UI and the controller (see below).
Route::middleware(['auth', 'verified', 'permission:roles.manage'])
    ->prefix('admin')
    ->name('admin.roles.')
    ->group(function () {
        Route::get('/roles', [RolesController::class, 'index'])->name('index');
        Route::patch('/roles/{role}/permissions', [RolesController::class, 'update'])->name('update');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
