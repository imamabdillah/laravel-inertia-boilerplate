<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class DokumenMitra extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'mitra_id',
        'jenis_dokumen',
        'wajib',
        'nama_file',
        'file_path',
        'file_type',
        'file_size',
        'status',
        'catatan',
    ];

    protected $casts = [
        'wajib'     => 'boolean',
        'file_size' => 'integer',
    ];

    public function mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class);
    }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1_048_576) {
            return round($bytes / 1_048_576, 2) . ' MB';
        }

        if ($bytes >= 1_024) {
            return round($bytes / 1_024, 1) . ' KB';
        }

        return $bytes . ' B';
    }
}
