<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembahasan_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pembahasan_id')->constrained()->cascadeOnDelete();
            $table->enum('tahap', ['awal', 'lanjutan', 'rk', 'finalisasi', 'validasi', 'penandatanganan']);
            $table->enum('event', ['dimulai', 'tahap_selesai', 'dibatalkan']);
            $table->text('catatan')->nullable();
            $table->text('ruang_lingkup')->nullable();
            $table->text('rencana_kerja')->nullable();
            $table->string('nomor_pks')->nullable();
            $table->date('tanggal_tandatangan')->nullable();
            $table->char('completed_by', 36)->nullable()->index();
            $table->foreign('completed_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembahasan_histories');
    }
};
