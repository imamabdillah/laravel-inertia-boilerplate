<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $menus = [
            ['name' => 'Dashboard', 'icon' => 'LayoutDashboard', 'route' => 'admin.dashboard', 'permission' => null, 'order' => 1],
            ['name' => 'User Management', 'icon' => 'Users', 'route' => 'admin.users.index', 'permission' => 'users.view', 'order' => 2],
            ['name' => 'Role Management', 'icon' => 'ShieldCheck', 'route' => 'admin.roles.index', 'permission' => 'roles.view', 'order' => 3],
            ['name' => 'Permission Management', 'icon' => 'KeyRound', 'route' => 'admin.permissions.index', 'permission' => 'permissions.view', 'order' => 4],
            ['name' => 'Menu Management', 'icon' => 'Menu', 'route' => 'admin.menus.index', 'permission' => 'menus.view', 'order' => 5],
            ['name' => 'Settings', 'icon' => 'Settings', 'route' => 'admin.settings.index', 'permission' => 'settings.view', 'order' => 6],
            ['name' => 'Activity Log', 'icon' => 'ClipboardList', 'route' => 'admin.activity-log.index', 'permission' => 'activity-log.view', 'order' => 7],
            ['name' => 'Ref UPT', 'icon' => 'Building2', 'route' => 'admin.ref-upt.index', 'permission' => 'ref-upt.view', 'order' => 8],
            ['name' => 'Ref Direktorat', 'icon' => 'Landmark', 'route' => 'admin.ref-direktorat.index', 'permission' => 'ref-direktorat.view', 'order' => 9],
            ['name' => 'Audiensi', 'icon' => 'CalendarCheck', 'route' => '/audiensi', 'permission' => 'audiensi.view', 'order' => 10],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(['name' => $menu['name']], array_merge($menu, ['is_active' => true]));
        }
    }
}
