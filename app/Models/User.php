<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property string $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property bool $is_active
 * @property int|null $direktorat_id
 * @property int|null $upt_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'is_active', 'direktorat_id', 'upt_id'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, HasUuids, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<RefDirektorat, $this> */
    public function direktorat(): BelongsTo
    {
        return $this->belongsTo(RefDirektorat::class);
    }

    /** @return BelongsTo<RefUpt, $this> */
    public function upt(): BelongsTo
    {
        return $this->belongsTo(RefUpt::class);
    }

    /**
     * User unit pelaksana audiensi (direktorat teknis / UPT) — lihat modul Audiensi.
     */
    public function isAudiensiPelaksana(): bool
    {
        return $this->hasAnyRole(['admin_direktorat', 'admin_upt']);
    }

    /**
     * Kode pelaksana audiensi milik user ini (cocok dengan Audiensi::pelaksana),
     * berdasarkan role generik (admin_direktorat/admin_upt) + unit yang di-assign.
     * Null kalau user bukan pelaksana atau belum punya unit.
     */
    public function pelaksanaUnitCode(): ?string
    {
        if ($this->hasRole('admin_direktorat') && $this->direktorat) {
            return $this->direktorat->code;
        }

        if ($this->hasRole('admin_upt') && $this->upt) {
            return "upt_{$this->upt->code}";
        }

        return null;
    }
}
