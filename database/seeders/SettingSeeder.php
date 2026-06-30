<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'app_name', 'value' => config('app.name', 'Laravel'), 'group' => 'general'],
            ['key' => 'app_logo', 'value' => null, 'group' => 'general'],
            ['key' => 'app_email', 'value' => 'admin@example.com', 'group' => 'general'],
            ['key' => 'app_footer', 'value' => '© ' . date('Y') . ' ' . config('app.name', 'Laravel') . '. All rights reserved.', 'group' => 'general'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
