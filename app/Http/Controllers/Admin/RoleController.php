<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\SyncPermissionsRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
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
                'id'               => $role->id,
                'name'             => $role->name,
                'users_count'      => $role->users_count,
                'permissions_count' => $role->permissions_count,
                'permissions'      => $role->permissions->pluck('name'),
                'is_protected'     => $role->name === 'super_admin',
            ]);

        $allPermissions = Permission::orderBy('name')->get()
            ->groupBy(fn ($p) => explode('.', $p->name)[0])
            ->map(fn ($items, $group) => [
                'group' => $group,
                'permissions' => $items->pluck('name')->values(),
            ])
            ->values();

        return Inertia::render('admin/roles/index', [
            'roles'       => $roles,
            'permissions' => $allPermissions,
            'filters'     => $request->only(['search']),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        activity()->causedBy(auth()->user())->on($role)->log('created');

        return back()->with('success', "Role \"{$role->name}\" berhasil dibuat.");
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            return back()->with('error', 'Role super_admin tidak bisa diubah.');
        }

        $old = $role->name;
        $role->update(['name' => $request->name]);

        activity()->causedBy(auth()->user())->on($role)->log('updated');

        return back()->with('success', "Role \"{$old}\" diubah menjadi \"{$role->name}\".");
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            return back()->with('error', 'Role super_admin tidak bisa dihapus.');
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', "Role \"{$role->name}\" masih dipakai {$role->users()->count()} user.");
        }

        activity()->causedBy(auth()->user())->on($role)->log('deleted');

        $role->delete();

        return back()->with('success', "Role berhasil dihapus.");
    }

    public function syncPermissions(SyncPermissionsRequest $request, Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            return back()->with('error', 'Permission super_admin dikelola otomatis.');
        }

        $role->syncPermissions($request->permissions ?? []);

        activity()->causedBy(auth()->user())->on($role)->log('permissions_synced');

        return back()->with('success', "Permission role \"{$role->name}\" berhasil disimpan.");
    }
}
