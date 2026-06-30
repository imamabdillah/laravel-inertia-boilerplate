<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $roles = Role::orderBy('name')->get()
            ->map(fn (Role $r) => ['id' => $r->id, 'name' => $r->name]);

        $selectedRoleId = $request->integer('role_id') ?: ($roles->first()['id'] ?? null);
        $selectedRole   = $selectedRoleId ? Role::find($selectedRoleId) : null;
        $assignedNames  = $selectedRole
            ? $selectedRole->permissions->pluck('name')->flip()->toArray()
            : [];

        $permissions = Permission::withCount('roles')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'ilike', "%{$s}%"))
            ->orderBy('name')
            ->get()
            ->groupBy(fn ($p) => explode('.', $p->name)[0])
            ->map(fn ($items, $group) => [
                'group'       => $group,
                'permissions' => $items->map(fn ($p) => [
                    'id'          => $p->id,
                    'name'        => $p->name,
                    'roles_count' => $p->roles_count,
                    'assigned'    => isset($assignedNames[$p->name]),
                ])->values(),
            ])
            ->values();

        return Inertia::render('admin/permissions/index', [
            'groups'         => $permissions,
            'roles'          => $roles,
            'selectedRoleId' => $selectedRoleId,
            'filters'        => $request->only(['search', 'role_id']),
        ]);
    }

    public function store(StorePermissionRequest $request): RedirectResponse
    {
        $permission = Permission::create(['name' => $request->name, 'guard_name' => 'web']);

        activity()->causedBy(auth()->user())->on($permission)->log('created');

        return back()->with('success', "Permission \"{$permission->name}\" berhasil dibuat.");
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        if ($permission->roles()->count() > 0) {
            $roleNames = $permission->roles->pluck('name')->join(', ');
            return back()->with('error', "Permission masih dipakai role: {$roleNames}.");
        }

        activity()->causedBy(auth()->user())->on($permission)->log('deleted');

        $permission->delete();

        return back()->with('success', "Permission \"{$permission->name}\" berhasil dihapus.");
    }
}
