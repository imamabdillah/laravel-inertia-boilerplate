<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pembahasan extends Model
{
    use SoftDeletes;

    public const TAHAP_AWAL = 'awal';

    public const TAHAP_LANJUTAN = 'lanjutan';

    public const TAHAP_RK = 'rk';

    public const TAHAP_FINALISASI = 'finalisasi';

    public const TAHAP_VALIDASI = 'validasi';

    public const TAHAP_PENANDATANGANAN = 'penandatanganan';

    public const TAHAP_ORDER = [
        self::TAHAP_AWAL,
        self::TAHAP_LANJUTAN,
        self::TAHAP_RK,
        self::TAHAP_FINALISASI,
        self::TAHAP_VALIDASI,
        self::TAHAP_PENANDATANGANAN,
    ];

    // Tahap 1-3: dieksekusi direktorat teknis/UPT (pelaksana yang diwarisi dari Audiensi).
    public const TAHAP_GROUP_DIREKTORAT = [self::TAHAP_AWAL, self::TAHAP_LANJUTAN, self::TAHAP_RK];

    // Tahap 4-6: ranah Setditjen (mewakili fungsi Biro Roren KS & Biro Hukum) — admin/super_admin saja.
    public const TAHAP_GROUP_SETDITJEN = [self::TAHAP_FINALISASI, self::TAHAP_VALIDASI, self::TAHAP_PENANDATANGANAN];

    protected $table = 'pembahasans';

    protected $fillable = [
        'mitra_id',
        'audiensi_id',
        'pelaksana',
        'tahap',
        'status',
        'ruang_lingkup',
        'rencana_kerja',
        'nomor_pks',
        'tanggal_tandatangan',
        'catatan',
        'completed_by',
    ];

    protected $casts = [
        'tanggal_tandatangan' => 'date',
    ];

    /** @return BelongsTo<Mitra, $this> */
    public function mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class);
    }

    /** @return BelongsTo<Audiensi, $this> */
    public function audiensi(): BelongsTo
    {
        return $this->belongsTo(Audiensi::class);
    }

    /** @return BelongsTo<User, $this> */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Label 6 tahap Pembahasan, urut sesuai TAHAP_ORDER.
     *
     * @return array<string, string>
     */
    public static function tahapLabels(): array
    {
        return [
            self::TAHAP_AWAL => 'Pembahasan Awal',
            self::TAHAP_LANJUTAN => 'Pembahasan Lanjutan',
            self::TAHAP_RK => 'Pembahasan RK',
            self::TAHAP_FINALISASI => 'Finalisasi',
            self::TAHAP_VALIDASI => 'Validasi',
            self::TAHAP_PENANDATANGANAN => 'Penandatanganan',
        ];
    }

    /**
     * Tahap berikutnya di TAHAP_ORDER, atau null kalau sudah di tahap terakhir.
     */
    public function nextTahap(): ?string
    {
        $index = array_search($this->tahap, self::TAHAP_ORDER, true);

        return self::TAHAP_ORDER[$index + 1] ?? null;
    }

    /**
     * Tahap 1-3 dieksekusi pelaksana (direktorat/UPT) yang unitnya cocok dengan
     * $this->pelaksana; tahap 4-6 hanya admin/super_admin (Setditjen). Super_admin
     * dan admin selalu boleh (monitoring + eksekusi Setditjen-level).
     */
    public function canAdvanceTahap(User $user): bool
    {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return true;
        }

        if (in_array($this->tahap, self::TAHAP_GROUP_DIREKTORAT, true)) {
            return $user->pelaksanaUnitCode() === $this->pelaksana;
        }

        return false;
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return $query;
        }

        $unitCode = $user->pelaksanaUnitCode();

        return $unitCode ? $query->where('pelaksana', $unitCode) : $query->whereRaw('1 = 0');
    }
}
