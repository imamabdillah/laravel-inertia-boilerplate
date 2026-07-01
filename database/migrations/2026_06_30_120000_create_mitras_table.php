<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mitras', function (Blueprint $table) {
            $table->id();
            $table->char('user_id', 36)->index();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->string('nama_lembaga');
            $table->enum('jenis_lembaga', [
                'perguruan_tinggi',
                'lembaga_pelatihan',
                'perusahaan',
                'lsm',
                'instansi_pemerintah',
                'lainnya',
            ]);
            $table->string('bidang_kerja');
            $table->text('deskripsi')->nullable();
            $table->text('alamat')->nullable();
            $table->string('kota')->nullable();
            $table->string('provinsi')->nullable();
            $table->string('kode_pos')->nullable();
            $table->string('website')->nullable();
            $table->string('telepon');
            $table->string('email_lembaga');
            $table->string('pic_nama');
            $table->string('pic_jabatan');
            $table->string('pic_telepon');
            $table->string('pic_email');
            $table->string('nomor_akta')->nullable();
            $table->string('nomor_nib')->nullable();
            $table->string('nomor_npwp')->nullable();
            $table->enum('status', [
                'draft',
                'menunggu_verifikasi',
                'diverifikasi',
                'ditolak',
                'aktif',
                'nonaktif',
            ])->default('draft');
            $table->text('catatan_admin')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->char('verified_by', 36)->nullable()->index();
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
            $table->string('logo')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mitras');
    }
};
