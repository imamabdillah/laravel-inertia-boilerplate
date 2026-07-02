<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Derive resources from menus — no hardcoded permissions needed.
        // Each menu with a permission field generates 4 standard permissions.
        $resources = Menu::whereNotNull('permission')
            ->where('permission', '!=', '')
            ->pluck('permission')
            ->map(fn ($p) => Str::beforeLast($p, '.'))
            ->unique()
            ->values();

        foreach ($resources as $resource) {
            foreach (['view', 'create', 'edit', 'delete'] as $action) {
                Permission::firstOrCreate(['name' => "{$resource}.{$action}", 'guard_name' => 'web']);
            }
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // Admin gets view-only on all resources by default.
        // Extend via Permission Management UI as needed.
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(
            Permission::where('name', 'like', '%.view')->get()
        );
    }
}
