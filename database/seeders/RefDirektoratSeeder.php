<?php

namespace Database\Seeders;

use App\Models\RefDirektorat;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RefDirektoratSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $names = [
            'Direktorat PAUD',
            'Direktorat Dikdas',
            'Direktorat Dikmen',
        ];

        foreach ($names as $i => $name) {
            RefDirektorat::updateOrCreate(
                ['code' => Str::slug($name, '_')],
                ['name' => $name, 'order' => $i + 1, 'is_active' => true],
            );
        }
    }
}
