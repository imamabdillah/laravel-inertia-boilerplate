<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class RefUpt extends Model
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
     * Opsi untuk multi-select tag di profil mitra: [{value, label}].
     */
    public static function options(): array
    {
        return static::active()
            ->orderBy('order')
            ->get(['code', 'name'])
            ->map(fn (self $upt) => ['value' => $upt->code, 'label' => $upt->name])
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
