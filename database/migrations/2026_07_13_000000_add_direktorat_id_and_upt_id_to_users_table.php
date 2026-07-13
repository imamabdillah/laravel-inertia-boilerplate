<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('direktorat_id')->nullable()->after('is_active')
                ->constrained('ref_direktorats')->nullOnDelete();
            $table->foreignId('upt_id')->nullable()->after('direktorat_id')
                ->constrained('ref_upts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('direktorat_id');
            $table->dropConstrainedForeignId('upt_id');
        });
    }
};
