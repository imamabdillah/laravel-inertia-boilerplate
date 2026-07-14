<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembahasans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mitra_id')->constrained()->cascadeOnDelete();
            $table->foreignId('audiensi_id')->nullable()->constrained()->nullOnDelete();
            // Warisan dari audiensis.pelaksana — unit yang eksekusi tahap 1-3 (awal/lanjutan/rk).
            $table->string('pelaksana');
            $table->enum('tahap', ['awal', 'lanjutan', 'rk', 'finalisasi', 'validasi', 'penandatanganan'])->default('awal');
            $table->enum('status', ['berjalan', 'selesai', 'dibatalkan'])->default('berjalan');
            $table->text('ruang_lingkup')->nullable();
            $table->text('rencana_kerja')->nullable();
            $table->string('nomor_pks')->nullable();
            $table->date('tanggal_tandatangan')->nullable();
            $table->text('catatan')->nullable();
            $table->char('completed_by', 36)->nullable()->index();
            $table->foreign('completed_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembahasans');
    }
};
