<?php

namespace Tests\Feature;

use App\Models\Audiensi;
use App\Models\Mitra;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AudiensiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'mitra', 'direktorat_dikdas', 'direktorat_dikmen'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }

    private function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function createPelaksana(string $role): User
    {
        Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        $user = User::factory()->create();
        $user->assignRole($role);

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
        // Satu direktorat (sd + smp keduanya dikdas)
        $this->assertSame('direktorat_dikdas', $this->createMitra(['jenjang' => ['sd', 'smp']])->suggested_pelaksana);

        // Lintas direktorat -> Setditjen
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
}
