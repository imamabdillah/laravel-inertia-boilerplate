<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * model_id char(36) tidak bisa dibandingkan dengan binding integer di Postgres
     * (bpchar = integer error). Semua model ber-media (DokumenMitra, Pembahasan)
     * pakai id bigint — kalau nanti ada model ber-UUID (mis. User) butuh media,
     * kolom ini harus dimigrasi ulang.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE bigint USING model_id::bigint');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE media ALTER COLUMN model_id TYPE char(36) USING model_id::char(36)');
    }
};
