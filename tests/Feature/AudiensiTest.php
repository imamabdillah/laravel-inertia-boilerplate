<?php

namespace Tests\Feature;

use App\Models\Audiensi;
use App\Models\Mitra;
use App\Models\RefDirektorat;
use App\Models\RefUpt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AudiensiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['super_admin', 'admin', 'mitra', 'admin_direktorat', 'admin_upt'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // AssignAudiensiRequest memvalidasi 'pelaksana' terhadap data RefDirektorat/RefUpt
        // sungguhan (Audiensi::pelaksanaLabels()), bukan cuma nama role — jadi kode yang
        // dipakai berulang di test ini butuh row referensinya sendiri.
        foreach (['direktorat_dikdas' => 'Direktorat Dikdas', 'direktorat_dikmen' => 'Direktorat Dikmen'] as $code => $name) {
            RefDirektorat::firstOrCreate(['code' => $code], ['name' => $name, 'order' => 1, 'is_active' => true]);
        }
    }

    private function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function createSuperAdmin(): User
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super_admin');
        $superAdmin->givePermissionTo(
            Permission::firstOrCreate(['name' => 'users.create', 'guard_name' => 'web']),
            Permission::firstOrCreate(['name' => 'users.edit', 'guard_name' => 'web']),
        );

        return $superAdmin;
    }

    /**
     * Buat user pelaksana audiensi. $pelaksanaCode adalah nilai Audiensi::pelaksana
     * (mis. 'direktorat_dikdas' atau 'upt_bgtk_jawa_barat') — user di-assign role
     * generik yang sesuai (admin_direktorat/admin_upt) plus unit yang cocok.
     */
    private function createPelaksana(string $pelaksanaCode): User
    {
        $user = User::factory()->create();

        if (str_starts_with($pelaksanaCode, 'upt_')) {
            $code = substr($pelaksanaCode, 4);
            $upt = RefUpt::firstOrCreate(['code' => $code], ['name' => $code, 'order' => 1, 'is_active' => true]);
            $user->assignRole('admin_upt');
            $user->update(['upt_id' => $upt->id]);
        } else {
            $direktorat = RefDirektorat::firstOrCreate(['code' => $pelaksanaCode], ['name' => $pelaksanaCode, 'order' => 1, 'is_active' => true]);
            $user->assignRole('admin_direktorat');
            $user->update(['direktorat_id' => $direktorat->id]);
        }

        return $user;
    }

    private function createMitra(array $attributes = []): Mitra
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        return Mitra::create(array_merge([
            'user_id' => $user->id,
            'nama_lembaga' => 'PT Mitra Edukasi',
            'jenis_lembaga' => 'perusahaan',
            'bidang_kerja' => 'Pelatihan Guru',
            'telepon' => '08123456789',
            'email_lembaga' => 'mitra@example.com',
            'pic_nama' => 'Budi',
            'pic_jabatan' => 'Direktur',
            'pic_telepon' => '08123456780',
            'pic_email' => 'budi@example.com',
            'status' => 'diverifikasi',
        ], $attributes));
    }

    public function test_suggested_pelaksana_mengikuti_tag_mitra(): void
    {
        // Satu direktorat (sd + smp keduanya dikdas) -> dikdas, BUKAN Setditjen
        $this->assertSame('direktorat_dikdas', $this->createMitra(['jenjang' => ['sd', 'smp']])->suggested_pelaksana);
        $this->assertSame('direktorat_dikdas', $this->createMitra(['jenjang' => ['sd']])->suggested_pelaksana);
        $this->assertSame('direktorat_dikmen', $this->createMitra(['jenjang' => ['sma']])->suggested_pelaksana);

        // Lintas direktorat (dikdas + dikmen) -> Setditjen
        $this->assertSame('sesditjen', $this->createMitra(['jenjang' => ['sd', 'sma']])->suggested_pelaksana);
        $this->assertSame('sesditjen', $this->createMitra(['jenjang' => ['sd', 'smp', 'sma']])->suggested_pelaksana);

        // Hanya tag UPT -> UPT tersebut
        $this->assertSame('upt_bgtk_jawa_barat', $this->createMitra(['upt' => ['bgtk_jawa_barat']])->suggested_pelaksana);

        // Campuran jenjang + UPT (lintas unit) -> Setditjen
        $this->assertSame('sesditjen', $this->createMitra(['jenjang' => ['sd'], 'upt' => ['bgtk_jawa_barat']])->suggested_pelaksana);

        // Tanpa tag -> Setditjen
        $this->assertSame('sesditjen', $this->createMitra()->suggested_pelaksana);
    }

    public function test_admin_dapat_menugaskan_audiensi(): void
    {
        $mitra = $this->createMitra();

        $response = $this->actingAs($this->createAdmin())
            ->post("/admin/mitras/{$mitra->id}/audiensi", ['pelaksana' => 'direktorat_dikdas']);

        $response->assertRedirect();
        $this->assertDatabaseHas('audiensis', [
            'mitra_id' => $mitra->id,
            'pelaksana' => 'direktorat_dikdas',
            'status' => 'ditugaskan',
        ]);
    }

    public function test_penugasan_ditolak_jika_mitra_belum_diverifikasi(): void
    {
        $mitra = $this->createMitra(['status' => 'menunggu_verifikasi']);

        $this->actingAs($this->createAdmin())
            ->post("/admin/mitras/{$mitra->id}/audiensi", ['pelaksana' => 'direktorat_dikdas']);

        $this->assertDatabaseCount('audiensis', 0);
    }

    public function test_pelaksana_dapat_menjadwalkan_dan_mencatat_hasil_lanjut(): void
    {
        $mitra = $this->createMitra();
        $audiensi = $mitra->audiensis()->create([
            'pelaksana' => 'direktorat_dikdas',
            'status' => 'ditugaskan',
        ]);

        $pelaksana = $this->createPelaksana('direktorat_dikdas');

        $this->actingAs($pelaksana)
            ->patch("/audiensi/{$audiensi->id}/jadwal", [
                'jadwal' => '2026-07-20T10:00',
                'lokasi' => 'Ruang Rapat GTK Lt. 12',
            ])
            ->assertRedirect();

        $this->assertSame('dijadwalkan', $audiensi->fresh()->status);

        $this->actingAs($pelaksana)
            ->post("/audiensi/{$audiensi->id}/hasil", [
                'hasil' => 'lanjut',
                'catatan_hasil' => 'Audiensi berjalan baik, lanjut ke pembahasan.',
            ])
            ->assertRedirect();

        $audiensi->refresh();
        $this->assertSame('selesai', $audiensi->status);
        $this->assertSame('lanjut', $audiensi->hasil);
        $this->assertSame('diverifikasi', $mitra->fresh()->status);

        // Hasil 'lanjut' jadi gerbang otomatis masuk fase Pembahasan.
        $this->assertDatabaseHas('pembahasans', [
            'mitra_id' => $mitra->id,
            'audiensi_id' => $audiensi->id,
            'pelaksana' => 'direktorat_dikdas',
            'tahap' => 'awal',
            'status' => 'berjalan',
        ]);
    }

    public function test_hasil_ditolak_menolak_pengajuan_mitra(): void
    {
        $mitra = $this->createMitra();
        $audiensi = $mitra->audiensis()->create([
            'pelaksana' => 'direktorat_dikdas',
            'status' => 'dijadwalkan',
            'jadwal' => now()->addDay(),
            'lokasi' => 'Zoom',
        ]);

        $this->actingAs($this->createPelaksana('direktorat_dikdas'))
            ->post("/audiensi/{$audiensi->id}/hasil", [
                'hasil' => 'ditolak',
                'catatan_hasil' => 'Ruang lingkup tidak sesuai prioritas program.',
            ]);

        $mitra->refresh();
        $this->assertSame('ditolak', $mitra->status);
        $this->assertSame('Ruang lingkup tidak sesuai prioritas program.', $mitra->catatan_admin);
    }

    public function test_pelaksana_lain_tidak_bisa_mengeksekusi_audiensi(): void
    {
        $mitra = $this->createMitra();
        $audiensi = $mitra->audiensis()->create([
            'pelaksana' => 'direktorat_dikdas',
            'status' => 'ditugaskan',
        ]);

        $this->actingAs($this->createPelaksana('direktorat_dikmen'))
            ->patch("/audiensi/{$audiensi->id}/jadwal", [
                'jadwal' => '2026-07-20T10:00',
                'lokasi' => 'Zoom',
            ])
            ->assertForbidden();
    }

    public function test_index_dibatasi_sesuai_role(): void
    {
        $mitraA = $this->createMitra();
        $mitraA->audiensis()->create(['pelaksana' => 'direktorat_dikdas', 'status' => 'ditugaskan']);
        $mitraB = $this->createMitra(['email_lembaga' => 'lain@example.com']);
        $mitraB->audiensis()->create(['pelaksana' => 'direktorat_dikmen', 'status' => 'ditugaskan']);

        // Pelaksana hanya melihat audiensi unitnya
        $dikdas = $this->createPelaksana('direktorat_dikdas');
        $this->assertSame(1, Audiensi::forUser($dikdas)->count());

        // Admin (Setditjen) memonitor semua
        $this->assertSame(2, Audiensi::forUser($this->createAdmin())->count());

        // Akses halaman
        $this->withoutVite();
        $this->actingAs($dikdas)->get('/audiensi')->assertOk();

        // Role mitra tidak boleh akses
        $mitraUser = User::factory()->create();
        $mitraUser->assignRole('mitra');
        $this->actingAs($mitraUser)->get('/audiensi')->assertForbidden();
    }

    public function test_index_dibatasi_sesuai_unit_upt(): void
    {
        $mitraA = $this->createMitra();
        $mitraA->audiensis()->create(['pelaksana' => 'upt_bgtk_jawa_barat', 'status' => 'ditugaskan']);
        $mitraB = $this->createMitra(['email_lembaga' => 'lain@example.com']);
        $mitraB->audiensis()->create(['pelaksana' => 'upt_bgtk_jawa_tengah', 'status' => 'ditugaskan']);

        $uptJabar = $this->createPelaksana('upt_bgtk_jawa_barat');

        $this->assertSame(1, Audiensi::forUser($uptJabar)->count());
    }

    public function test_super_admin_dapat_membuat_admin_direktorat(): void
    {
        $direktorat = RefDirektorat::create(['code' => 'direktorat_paud', 'name' => 'Direktorat PAUD', 'order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->createSuperAdmin())->post('/admin/users', [
            'name' => 'Admin PAUD',
            'email' => 'admin.paud@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['admin_direktorat'],
            'direktorat_id' => $direktorat->id,
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/users');

        $user = User::where('email', 'admin.paud@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('admin_direktorat'));
        $this->assertSame($direktorat->id, $user->direktorat_id);
        $this->assertSame('direktorat_paud', $user->pelaksanaUnitCode());
    }

    public function test_admin_direktorat_wajib_pilih_direktorat(): void
    {
        $response = $this->actingAs($this->createSuperAdmin())->post('/admin/users', [
            'name' => 'Admin Tanpa Unit',
            'email' => 'admin.tanpaunit@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['admin_direktorat'],
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('direktorat_id');
        $this->assertDatabaseMissing('users', ['email' => 'admin.tanpaunit@example.com']);
    }

    public function test_user_tidak_boleh_jadi_admin_direktorat_dan_admin_upt_sekaligus(): void
    {
        $direktorat = RefDirektorat::where('code', 'direktorat_dikmen')->firstOrFail();
        $upt = RefUpt::create(['code' => 'bgtk_bali', 'name' => 'BGTK Bali', 'order' => 1, 'is_active' => true]);

        $response = $this->actingAs($this->createSuperAdmin())->post('/admin/users', [
            'name' => 'Admin Rangkap',
            'email' => 'admin.rangkap@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['admin_direktorat', 'admin_upt'],
            'direktorat_id' => $direktorat->id,
            'upt_id' => $upt->id,
            'is_active' => true,
        ]);

        $response->assertSessionHasErrors('roles');
        $this->assertDatabaseMissing('users', ['email' => 'admin.rangkap@example.com']);
    }
}
