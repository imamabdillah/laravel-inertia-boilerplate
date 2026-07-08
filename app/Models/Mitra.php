<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mitra extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'nama_lembaga',
        'jenis_lembaga',
        'jenis_lembaga_lainnya',
        'bidang_kerja',
        'jenjang',
        'wilayah',
        'upt',
        'deskripsi',
        'alamat',
        'kota',
        'provinsi',
        'kode_pos',
        'website',
        'telepon',
        'email_lembaga',
        'pic_nama',
        'pic_jabatan',
        'pic_telepon',
        'pic_email',
        'nomor_akta',
        'nomor_nib',
        'nomor_npwp',
        'status',
        'catatan_admin',
        'verified_at',
        'verified_by',
        'logo',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'jenjang' => 'array',
        'wilayah' => 'array',
        'upt' => 'array',
    ];

    const DOKUMEN_WAJIB = ['surat_pengajuan', 'proposal_kerja_sama', 'dokumen_legalitas', 'profil_perusahaan'];

    const JENJANG_OPTIONS = ['paud_tk', 'sd', 'smp', 'sma'];

    const WILAYAH_OPTIONS = ['jawa_barat'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dokumens(): HasMany
    {
        return $this->hasMany(DokumenMitra::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function getIsProfileCompleteAttribute(): bool
    {
        $required = [
            'nama_lembaga', 'jenis_lembaga', 'bidang_kerja',
            'telepon', 'email_lembaga',
            'pic_nama', 'pic_jabatan', 'pic_telepon', 'pic_email',
        ];

        foreach ($required as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }

        return true;
    }

    public function getIsDocumentsCompleteAttribute(): bool
    {
        $uploaded = $this->dokumens()
            ->whereIn('jenis_dokumen', self::DOKUMEN_WAJIB)
            ->where('status', '!=', 'ditolak')
            ->pluck('jenis_dokumen')
            ->all();

        foreach (self::DOKUMEN_WAJIB as $jenis) {
            if (! in_array($jenis, $uploaded)) {
                return false;
            }
        }

        return true;
    }

    public function getCanSubmitAttribute(): bool
    {
        return $this->is_profile_complete && $this->is_documents_complete;
    }

    public function getIsAllDokumenVerifiedAttribute(): bool
    {
        $diterima = $this->dokumens()
            ->whereIn('jenis_dokumen', self::DOKUMEN_WAJIB)
            ->where('status', 'diterima')
            ->pluck('jenis_dokumen')
            ->all();

        foreach (self::DOKUMEN_WAJIB as $jenis) {
            if (! in_array($jenis, $diterima)) {
                return false;
            }
        }

        return true;
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'diverifikasi');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'menunggu_verifikasi');
    }
}
