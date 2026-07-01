<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('dashboard', function () {
    $user = auth()->user();
    if ($user && $user->hasAnyRole(['super_admin', 'admin'])) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('profile.edit');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::prefix('admin')
    ->middleware(['auth', 'verified', 'role:super_admin|admin'])
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        Route::resource('users', UserController::class)->except(['show']);
        Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
        Route::patch('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');

        Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
        Route::patch('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
        Route::patch('roles/{role}/sync-permissions', [RoleController::class, 'syncPermissions'])->name('roles.sync-permissions');

        Route::get('permissions', [PermissionController::class, 'index'])->name('permissions.index');
        Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

        Route::get('menus', [MenuController::class, 'index'])->name('menus.index');
        Route::post('menus', [MenuController::class, 'store'])->name('menus.store');
        Route::patch('menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
        Route::patch('menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
        Route::delete('menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');
        Route::patch('menus/{menu}/toggle-active', [MenuController::class, 'toggleActive'])->name('menus.toggle-active');

        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::patch('settings', [SettingController::class, 'update'])->name('settings.update');

        Route::get('activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    });

require __DIR__.'/settings.php';
