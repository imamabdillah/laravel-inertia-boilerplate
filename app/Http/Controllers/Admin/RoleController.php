<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\SyncPermissionsRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $roles = Role::withCount(['users', 'permissions'])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'ilike', "%{$s}%"))
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
                'permissions_count' => $role->permissions_count,
            ]);

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        activity()->causedBy(auth()->user())->on($role)->log('created');

        Inertia::flash('toast', ['type' => 'success', 'message' => "Role \"{$role->name}\" berhasil dibuat."]);

        return back();
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Role super_admin tidak bisa diubah.']);

            return back();
        }

        $old = $role->name;
        $role->update(['name' => $request->name]);

        activity()->causedBy(auth()->user())->on($role)->log('updated');

        Inertia::flash('toast', ['type' => 'success', 'message' => "Role \"{$old}\" diubah menjadi \"{$role->name}\"."]);

        return back();
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Role super_admin tidak bisa dihapus.']);

            return back();
        }

        if ($role->users()->count() > 0) {
            Inertia::flash('toast', ['type' => 'error', 'message' => "Role \"{$role->name}\" masih dipakai {$role->users()->count()} user."]);

            return back();
        }

        activity()->causedBy(auth()->user())->on($role)->log('deleted');
        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role berhasil dihapus.']);

        return back();
    }

    public function syncPermissions(SyncPermissionsRequest $request, Role $role): RedirectResponse
    {
        $role->syncPermissions($request->permissions ?? []);

        activity()->causedBy(auth()->user())->on($role)->log('permissions_synced');

        Inertia::flash('toast', ['type' => 'success', 'message' => "Permission role \"{$role->name}\" berhasil disimpan."]);

        return back();
    }
}
