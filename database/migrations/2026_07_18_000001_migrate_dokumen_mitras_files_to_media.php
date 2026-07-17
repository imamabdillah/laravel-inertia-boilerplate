<?php

use App\Models\DokumenMitra;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        // Kolom file masih ada di titik ini; accessor model menshadow-nya,
        // jadi baca via getRawOriginal.
        DokumenMitra::query()->get()->each(function (DokumenMitra $dokumen) {
            $path = $dokumen->getRawOriginal('file_path');
            $namaFile = $dokumen->getRawOriginal('nama_file');

            if (! $path || ! Storage::disk('public')->exists($path)) {
                return;
            }

            try {
                $dokumen->addMediaFromDisk($path, 'public')
                    ->usingFileName($namaFile ?: basename($path))
                    ->preservingOriginal()
                    ->toMediaCollection('file');
            } catch (\Throwable $e) {
                Log::warning("Gagal migrasi file dokumen_mitras #{$dokumen->id} ke media: {$e->getMessage()}");
            }
        });

        Storage::disk('public')->deleteDirectory('dokumen-mitra');

        Schema::table('dokumen_mitras', function (Blueprint $table) {
            $table->dropColumn(['nama_file', 'file_path', 'file_type', 'file_size']);
        });
    }

    public function down(): void
    {
        // Data file tidak bisa dikembalikan ke kolom lama — kolom di-restore nullable saja.
        Schema::table('dokumen_mitras', function (Blueprint $table) {
            $table->string('nama_file')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
        });
    }
};
