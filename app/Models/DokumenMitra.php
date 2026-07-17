<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class DokumenMitra extends Model implements HasMedia
{
    use InteractsWithMedia;
    use SoftDeletes;

    protected $fillable = [
        'mitra_id',
        'jenis_dokumen',
        'wajib',
        'status',
        'catatan',
    ];

    protected $casts = [
        'wajib' => 'boolean',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('file')
            ->singleFile()
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);
    }

    public function mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class);
    }

    public function getNamaFileAttribute(): ?string
    {
        return $this->getFirstMedia('file')?->file_name;
    }

    public function getFilePathAttribute(): ?string
    {
        return $this->getFirstMedia('file')?->getPathRelativeToRoot();
    }

    public function getFileTypeAttribute(): ?string
    {
        return $this->getFirstMedia('file')?->mime_type;
    }

    public function getFileSizeAttribute(): int
    {
        return (int) ($this->getFirstMedia('file')?->size ?? 0);
    }

    public function getFileUrlAttribute(): ?string
    {
        return $this->getFirstMedia('file')?->getUrl();
    }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1_048_576) {
            return round($bytes / 1_048_576, 2).' MB';
        }

        if ($bytes >= 1_024) {
            return round($bytes / 1_024, 1).' KB';
        }

        return $bytes.' B';
    }
}
