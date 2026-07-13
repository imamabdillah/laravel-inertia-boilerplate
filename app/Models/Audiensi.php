<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Audiensi extends Model
{
    use SoftDeletes;

    public const PELAKSANA_SESDITJEN = 'sesditjen';

    protected $table = 'audiensis';

    protected $fillable = [
        'mitra_id',
        'pelaksana',
        'assigned_by',
        'assigned_at',
        'jadwal',
        'lokasi',
        'status',
        'hasil',
        'catatan_hasil',
        'completed_by',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'jadwal' => 'datetime',
    ];

    /** @return BelongsTo<Mitra, $this> */
    public function mitra(): BelongsTo
    {
        return $this->belongsTo(Mitra::class);
    }

    /** @return BelongsTo<User, $this> */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /** @return BelongsTo<User, $this> */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Label semua kemungkinan pelaksana: Setditjen, direktorat teknis (ref_direktorats),
     * dan seluruh UPT (ref_upts).
     *
     * @return array<string, string>
     */
    public static function pelaksanaLabels(): array
    {
        $upt = [];
        foreach (RefUpt::labels() as $code => $name) {
            $upt["upt_{$code}"] = $name;
        }

        return [self::PELAKSANA_SESDITJEN => 'Setditjen GTK'] + RefDirektorat::labels() + $upt;
    }

    /**
     * Opsi dropdown penugasan pelaksana: [{value, label}].
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function pelaksanaOptions(): array
    {
        return collect(self::pelaksanaLabels())
            ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    /**
     * Pelaksana 'sesditjen' dieksekusi oleh admin/super_admin; unit lain oleh
     * user ber-role sama dengan nilai pelaksana (mis. 'direktorat_dikdas', 'upt_<code>').
     */
    public function canBeExecutedBy(User $user): bool
    {
        if ($this->pelaksana === self::PELAKSANA_SESDITJEN) {
            return $user->hasAnyRole(['super_admin', 'admin']);
        }

        return $user->hasRole('super_admin') || $user->hasRole($this->pelaksana);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        // Setditjen (admin/super_admin) memonitor seluruh audiensi.
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return $query;
        }

        return $query->whereIn('pelaksana', $user->roles->pluck('name'));
    }
}
