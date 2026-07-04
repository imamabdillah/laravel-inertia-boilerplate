<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        // Resources diambil dari permission field di menus — support n-level depth.
        // 'users.view' → resource 'users', 'mitra.profil.view' → resource 'mitra.profil'
        $menusByResource = Menu::whereNotNull('permission')
            ->where('permission', '!=', '')
            ->get()
            ->keyBy(fn (Menu $m) => Str::beforeLast($m->permission, '.'));

        $menuResources = $menusByResource->keys()->sort()->values();

        $roles          = Role::orderBy('name')->get()->map(fn ($r) => ['id' => $r->id, 'name' => $r->name]);
        $selectedRoleId = $request->integer('role_id') ?: ($roles->first()['id'] ?? null);
        $selectedRole   = $selectedRoleId ? Role::find($selectedRoleId) : null;
        $assignedNames  = $selectedRole
            ? $selectedRole->permissions->pluck('name')->flip()->toArray()
            : [];

        $standardActions = ['view', 'create', 'edit', 'delete'];

        $groups = Permission::withCount('roles')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'ilike', "%{$s}%"))
            ->orderBy('name')
            ->get()
            ->filter(fn ($p) => $menuResources->contains(Str::beforeLast($p->name, '.')))
            ->filter(fn ($p) => in_array(Str::afterLast($p->name, '.'), $standardActions))
            ->groupBy(fn ($p) => Str::beforeLast($p->name, '.'))
            ->map(fn ($items, $group) => [
                'group'       => $group,
                'name'        => $menusByResource->get($group)?->name,
                'permissions' => $items->map(fn ($p) => [
                    'id'          => $p->id,
                    'name'        => $p->name,
                    'roles_count' => $p->roles_count,
                    'assigned'    => isset($assignedNames[$p->name]),
                ])->values(),
            ])
            ->values();

        return Inertia::render('admin/permissions/index', [
            'groups'         => $groups,
            'roles'          => $roles,
            'selectedRoleId' => $selectedRoleId,
            'filters'        => $request->only(['search', 'role_id']),
        ]);
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
