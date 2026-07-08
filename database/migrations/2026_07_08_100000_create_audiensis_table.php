<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audiensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mitra_id')->constrained()->cascadeOnDelete();
            // Unit pelaksana audiensi: 'sesditjen', 'direktorat_<x>', atau 'upt_<code ref_upts>'.
            $table->string('pelaksana');
            $table->char('assigned_by', 36)->nullable()->index();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('jadwal')->nullable();
            $table->string('lokasi')->nullable();
            $table->enum('status', ['ditugaskan', 'dijadwalkan', 'selesai'])->default('ditugaskan');
            $table->enum('hasil', ['lanjut', 'ditolak'])->nullable();
            $table->text('catatan_hasil')->nullable();
            $table->char('completed_by', 36)->nullable()->index();
            $table->foreign('completed_by')->references('id')->on('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audiensis');
    }
};
