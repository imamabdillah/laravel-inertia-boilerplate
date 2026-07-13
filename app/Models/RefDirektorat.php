<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class RefDirektorat extends Model
{
    protected $fillable = [
        'code',
        'name',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Opsi untuk dropdown penugasan pelaksana audiensi: [{value, label}].
     */
    public static function options(): array
    {
        return static::active()
            ->orderBy('order')
            ->get(['code', 'name'])
            ->map(fn (self $direktorat) => ['value' => $direktorat->code, 'label' => $direktorat->name])
            ->values()
            ->all();
    }

    /**
     * Map code => name untuk render label di halaman admin.
     */
    public static function labels(): array
    {
        return static::orderBy('order')->pluck('name', 'code')->all();
    }
}
