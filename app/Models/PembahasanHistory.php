<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembahasanHistory extends Model
{
    protected $table = 'pembahasan_histories';

    protected $fillable = [
        'pembahasan_id',
        'tahap',
        'event',
        'catatan',
        'ruang_lingkup',
        'rencana_kerja',
        'nomor_pks',
        'tanggal_tandatangan',
        'completed_by',
    ];

    protected $casts = [
        'tanggal_tandatangan' => 'date',
    ];

    /** @return BelongsTo<Pembahasan, $this> */
    public function pembahasan(): BelongsTo
    {
        return $this->belongsTo(Pembahasan::class);
    }

    /** @return BelongsTo<User, $this> */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
