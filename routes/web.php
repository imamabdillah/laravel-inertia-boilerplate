<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\MitraController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RefDirektoratController;
use App\Http\Controllers\Admin\RefUptController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Audiensi\AudiensiController;
use App\Http\Controllers\Mitra\ProfilController;
use App\Http\Controllers\Pembahasan\PembahasanController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('dashboard', function () {
    $user = auth()->user();
    if ($user && $user->hasAnyRole(['super_admin', 'admin'])) {
        return redirect()->route('admin.dashboard');
    }
    if ($user && $user->isAudiensiPelaksana()) {
        return redirect()->route('audiensi.index');
    }
    if ($user && $user->hasRole('mitra')) {
        return redirect()->route('mitra.profil.show');
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

        Route::get('ref-upt', [RefUptController::class, 'index'])->name('ref-upt.index');
        Route::post('ref-upt', [RefUptController::class, 'store'])->name('ref-upt.store');
        Route::patch('ref-upt/{refUpt}', [RefUptController::class, 'update'])->name('ref-upt.update');
        Route::delete('ref-upt/{refUpt}', [RefUptController::class, 'destroy'])->name('ref-upt.destroy');
        Route::patch('ref-upt/{refUpt}/toggle-active', [RefUptController::class, 'toggleActive'])->name('ref-upt.toggle-active');

        Route::get('ref-direktorat', [RefDirektoratController::class, 'index'])->name('ref-direktorat.index');
        Route::post('ref-direktorat', [RefDirektoratController::class, 'store'])->name('ref-direktorat.store');
        Route::patch('ref-direktorat/{refDirektorat}', [RefDirektoratController::class, 'update'])->name('ref-direktorat.update');
        Route::delete('ref-direktorat/{refDirektorat}', [RefDirektoratController::class, 'destroy'])->name('ref-direktorat.destroy');
        Route::patch('ref-direktorat/{refDirektorat}/toggle-active', [RefDirektoratController::class, 'toggleActive'])->name('ref-direktorat.toggle-active');

        Route::get('settings', [SettingController::class, 'index'])->name('settings.index');
        Route::patch('settings', [SettingController::class, 'update'])->name('settings.update');

        Route::get('activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');

        Route::get('mitras', [MitraController::class, 'index'])->name('mitras.index');
        Route::get('mitras/{mitra}', [MitraController::class, 'show'])->name('mitras.show');
        Route::post('mitras/{mitra}/verify', [MitraController::class, 'verify'])->name('mitras.verify');
        Route::post('mitras/{mitra}/reject', [MitraController::class, 'reject'])->name('mitras.reject');
        Route::post('mitras/{mitra}/dokumens/{dokumen}/review', [MitraController::class, 'reviewDokumen'])->name('mitras.dokumens.review');
        Route::post('mitras/{mitra}/audiensi', [MitraController::class, 'assignAudiensi'])->name('mitras.audiensi.assign');
    });

// Pelaksana audiensi: direktorat teknis / UPT (role dinamis: direktorat_*, upt_<code>),
// plus admin/super_admin (Setditjen) untuk monitoring — otorisasi di controller & Form Request.
Route::prefix('audiensi')
    ->middleware(['auth', 'verified'])
    ->name('audiensi.')
    ->group(function () {
        Route::get('/', [AudiensiController::class, 'index'])->name('index');
        Route::get('{audiensi}', [AudiensiController::class, 'show'])->name('show');
        Route::patch('{audiensi}/jadwal', [AudiensiController::class, 'jadwal'])->name('jadwal');
        Route::post('{audiensi}/hasil', [AudiensiController::class, 'hasil'])->name('hasil');
    });

// Pembahasan: lanjutan Audiensi. Tahap 1-3 dieksekusi pelaksana (direktorat/UPT,
// warisan dari audiensi.pelaksana), tahap 4-6 hanya admin/super_admin (Setditjen)
// — otorisasi di model Pembahasan & Form Request, bukan middleware role di sini.
Route::prefix('pembahasan')
    ->middleware(['auth', 'verified'])
    ->name('pembahasan.')
    ->group(function () {
        Route::get('/', [PembahasanController::class, 'index'])->name('index');
        Route::get('{pembahasan}', [PembahasanController::class, 'show'])->name('show');
        Route::patch('{pembahasan}/advance', [PembahasanController::class, 'advance'])->name('advance');
        Route::post('{pembahasan}/batal', [PembahasanController::class, 'batalkan'])->name('batal');
    });

Route::prefix('mitra')
    ->middleware(['auth', 'verified', 'role:mitra'])
    ->name('mitra.')
    ->group(function () {
        Route::get('profil', [ProfilController::class, 'show'])->name('profil.show');
        Route::put('profil', [ProfilController::class, 'update'])->name('profil.update');
        Route::post('profil/dokumen', [ProfilController::class, 'uploadDokumen'])->name('profil.dokumen.upload');
        Route::delete('profil/dokumen/{dokumen}', [ProfilController::class, 'deleteDokumen'])->name('profil.dokumen.delete');
        Route::post('profil/submit', [ProfilController::class, 'submit'])->name('profil.submit');
    });

require __DIR__.'/settings.php';
