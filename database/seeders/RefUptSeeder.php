<?php

namespace Database\Seeders;

use App\Models\RefUpt;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RefUptSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $names = [
            'BBGTK Provinsi Sumatera Utara',
            'BBGTK Provinsi Jawa Barat',
            'BBGTK Provinsi Jawa Tengah',
            'BBGTK Provinsi Jawa Timur',
            'BBGTK Provinsi D.I. Yogyakarta',
            'BBGTK Provinsi Sulawesi Selatan',
            'BGTK Provinsi Aceh',
            'BGTK Provinsi Sumatera Barat',
            'BGTK Provinsi Riau',
            'BGTK Provinsi Jambi',
            'BGTK Provinsi Sumatera Selatan',
            'BGTK Provinsi Lampung',
            'BGTK Provinsi Banten',
            'BGTK Provinsi Bali',
            'BGTK Provinsi Nusa Tenggara Barat',
            'BGTK Provinsi Nusa Tenggara Timur',
            'BGTK Provinsi Kalimantan Barat',
            'BGTK Provinsi Kalimantan Timur',
            'BGTK Provinsi Kalimantan Selatan',
            'BGTK Provinsi Kalimantan Tengah',
            'BGTK Provinsi Sulawesi Utara',
            'BGTK Provinsi Sulawesi Tenggara',
            'BGTK Provinsi Sulawesi Tengah',
            'BGTK Provinsi Maluku',
            'BGTK Provinsi Papua',
            'BGTK Provinsi Papua Barat',
            'BGTK Provinsi DKI Jakarta',
            'KGTK Provinsi Kepulauan Riau',
            'KGTK Provinsi Kepulauan Bangka Belitung',
            'KGTK Provinsi Bengkulu',
            'KGTK Provinsi Kalimantan Utara',
            'KGTK Provinsi Sulawesi Barat',
            'KGTK Provinsi Gorontalo',
            'KGTK Provinsi Maluku Utara',
        ];

        foreach ($names as $i => $name) {
            RefUpt::updateOrCreate(
                ['code' => Str::slug($name, '_')],
                ['name' => $name, 'order' => $i + 1, 'is_active' => true],
            );
        }
    }
}
