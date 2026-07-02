<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            MenuSeeder::class,
            RolePermissionSeeder::class,
            SettingSeeder::class,
        ]);

        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'is_active' => true,
        ]);
        $superAdmin->assignRole('super_admin');

        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'is_active' => true,
        ]);
        $admin->assignRole('admin');
    }
}
