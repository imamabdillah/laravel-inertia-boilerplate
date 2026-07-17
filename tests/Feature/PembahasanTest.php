<?php

namespace Tests\Feature;

use App\Models\Mitra;
use App\Models\Pembahasan;
use App\Models\RefDirektorat;
use App\Models\RefUpt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PembahasanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['super_admin', 'admin', 'mitra', 'admin_direktorat', 'admin_upt'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

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

    /**
     * Lihat AudiensiTest::createPelaksana() — pola sama, $pelaksanaCode adalah
     * nilai Pembahasan::pelaksana (warisan dari Audiensi::pelaksana).
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

    private function createPembahasan(Mitra $mitra, string $pelaksanaCode, array $attributes = []): Pembahasan
    {
        return $mitra->pembahasans()->create(array_merge([
            'pelaksana' => $pelaksanaCode,
            'tahap' => Pembahasan::TAHAP_AWAL,
            'status' => 'berjalan',
        ], $attributes));
    }

    /** Advance penandatanganan wajib punya arsip PKS tertandatangan. */
    private function attachPksTertandatangan(Pembahasan $pembahasan): void
    {
        Storage::fake('public');
        $pembahasan->addMedia(
            UploadedFile::fake()->createWithContent('pks.pdf', "%PDF-1.4\n%fake pdf untuk test\n")
        )->toMediaCollection('pks_tertandatangan');
    }

    public function test_pelaksana_direktorat_dapat_menyelesaikan_tahap_1_sampai_3(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas');
        $pelaksana = $this->createPelaksana('direktorat_dikdas');

        $this->actingAs($pelaksana)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Ruang lingkup dan hak/kewajiban telah disepakati.',
                'ruang_lingkup' => 'Pelatihan guru PAUD di wilayah Jawa Barat.',
            ])
            ->assertRedirect();

        $pembahasan->refresh();
        $this->assertSame('lanjutan', $pembahasan->tahap);
        $this->assertSame('berjalan', $pembahasan->status);
        $this->assertSame('Pelatihan guru PAUD di wilayah Jawa Barat.', $pembahasan->ruang_lingkup);

        $this->actingAs($pelaksana)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Naskah kerja sama keseluruhan sudah dibahas.',
            ])
            ->assertRedirect();

        $this->assertSame('rk', $pembahasan->fresh()->tahap);

        $this->actingAs($pelaksana)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Rencana kerja detail telah disepakati kedua pihak.',
                'rencana_kerja' => 'Pelatihan 3 batch, masing-masing 40 peserta.',
            ])
            ->assertRedirect();

        $pembahasan->refresh();
        $this->assertSame('finalisasi', $pembahasan->tahap);
        $this->assertSame('berjalan', $pembahasan->status);
        $this->assertSame('Pelatihan 3 batch, masing-masing 40 peserta.', $pembahasan->rencana_kerja);

        // Setiap advance mencatat histori tahap yang baru saja diselesaikan.
        $this->assertSame(
            ['awal', 'lanjutan', 'rk'],
            $pembahasan->histories()->pluck('tahap')->all(),
        );
        $this->assertDatabaseHas('pembahasan_histories', [
            'pembahasan_id' => $pembahasan->id,
            'tahap' => 'awal',
            'event' => 'tahap_selesai',
            'ruang_lingkup' => 'Pelatihan guru PAUD di wilayah Jawa Barat.',
        ]);
        $this->assertDatabaseHas('pembahasan_histories', [
            'pembahasan_id' => $pembahasan->id,
            'tahap' => 'rk',
            'event' => 'tahap_selesai',
            'rencana_kerja' => 'Pelatihan 3 batch, masing-masing 40 peserta.',
        ]);
    }

    public function test_pelaksana_direktorat_tidak_bisa_advance_tahap_setditjen(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas', ['tahap' => Pembahasan::TAHAP_FINALISASI]);

        $this->actingAs($this->createPelaksana('direktorat_dikdas'))
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Draf final naskah dan rencana kerja sudah oke.',
            ])
            ->assertForbidden();
    }

    public function test_admin_dapat_menyelesaikan_tahap_4_sampai_6_dan_mitra_jadi_aktif(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas', ['tahap' => Pembahasan::TAHAP_FINALISASI]);
        $admin = $this->createAdmin();

        $this->actingAs($admin)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Draf final naskah dan rencana kerja sudah disepakati.',
            ])
            ->assertRedirect();

        $this->assertSame('validasi', $pembahasan->fresh()->tahap);

        $this->actingAs($admin)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Paraf pimpinan selesai, nomor PKS diterbitkan Biro Hukum.',
                'nomor_pks' => 'PKS/001/GTKPG/2026',
            ])
            ->assertRedirect();

        $pembahasan->refresh();
        $this->assertSame('penandatanganan', $pembahasan->tahap);
        $this->assertSame('PKS/001/GTKPG/2026', $pembahasan->nomor_pks);

        $this->attachPksTertandatangan($pembahasan);

        $this->actingAs($admin)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Dokumen PKS telah ditandatangani dan diarsipkan.',
                'tanggal_tandatangan' => '2026-07-20',
            ])
            ->assertRedirect();

        $pembahasan->refresh();
        $this->assertSame('penandatanganan', $pembahasan->tahap);
        $this->assertSame('selesai', $pembahasan->status);
        $this->assertNotNull($pembahasan->completed_by);
        $this->assertSame('aktif', $mitra->fresh()->status);
    }

    public function test_pelaksana_unit_lain_tidak_bisa_advance(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas');

        $this->actingAs($this->createPelaksana('direktorat_dikmen'))
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Mencoba advance tahap unit lain.',
                'ruang_lingkup' => 'Tidak seharusnya bisa.',
            ])
            ->assertForbidden();
    }

    public function test_admin_dapat_membatalkan_pembahasan(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas', ['tahap' => Pembahasan::TAHAP_LANJUTAN]);

        $this->actingAs($this->createAdmin())
            ->post("/pembahasan/{$pembahasan->id}/batal", [
                'catatan' => 'Mitra mengundurkan diri dari negosiasi kerja sama.',
            ])
            ->assertRedirect();

        $pembahasan->refresh();
        $this->assertSame('dibatalkan', $pembahasan->status);
        $this->assertSame('ditolak', $mitra->fresh()->status);
        $this->assertDatabaseHas('pembahasan_histories', [
            'pembahasan_id' => $pembahasan->id,
            'tahap' => 'lanjutan',
            'event' => 'dibatalkan',
        ]);
    }

    public function test_pelaksana_tidak_bisa_membatalkan(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas');

        $this->actingAs($this->createPelaksana('direktorat_dikdas'))
            ->post("/pembahasan/{$pembahasan->id}/batal", [
                'catatan' => 'Pelaksana mencoba membatalkan pembahasan.',
            ])
            ->assertForbidden();
    }

    public function test_advance_gagal_jika_sudah_selesai_atau_dibatalkan(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas', ['status' => 'dibatalkan']);

        $this->actingAs($this->createAdmin())
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Mencoba advance setelah dibatalkan.',
                'ruang_lingkup' => 'Tidak seharusnya tersimpan.',
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame('dibatalkan', $pembahasan->fresh()->status);
        $this->assertNull($pembahasan->fresh()->ruang_lingkup);
    }

    public function test_index_dibatasi_sesuai_role(): void
    {
        $mitraA = $this->createMitra();
        $this->createPembahasan($mitraA, 'direktorat_dikdas');
        $mitraB = $this->createMitra(['email_lembaga' => 'lain@example.com']);
        $this->createPembahasan($mitraB, 'direktorat_dikmen');

        $dikdas = $this->createPelaksana('direktorat_dikdas');
        $this->assertSame(1, Pembahasan::forUser($dikdas)->count());

        $this->assertSame(2, Pembahasan::forUser($this->createAdmin())->count());

        $this->withoutVite();
        $this->actingAs($dikdas)->get('/pembahasan')->assertOk();

        $mitraUser = User::factory()->create();
        $mitraUser->assignRole('mitra');
        $this->actingAs($mitraUser)->get('/pembahasan')->assertForbidden();
    }

    public function test_show_menampilkan_detail_untuk_pelaksana_terkait(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas');

        $this->withoutVite();
        $this->actingAs($this->createPelaksana('direktorat_dikdas'))
            ->get("/pembahasan/{$pembahasan->id}")
            ->assertOk();

        $this->actingAs($this->createAdmin())
            ->get("/pembahasan/{$pembahasan->id}")
            ->assertOk();
    }

    public function test_show_forbidden_untuk_unit_lain(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, 'direktorat_dikdas');

        $this->actingAs($this->createPelaksana('direktorat_dikmen'))
            ->get("/pembahasan/{$pembahasan->id}")
            ->assertForbidden();
    }

    public function test_validasi_field_wajib_per_tahap(): void
    {
        $mitra = $this->createMitra();
        $admin = $this->createAdmin();

        $awal = $this->createPembahasan($mitra, 'direktorat_dikdas');
        $this->actingAs($admin)
            ->patch("/pembahasan/{$awal->id}/advance", ['catatan' => 'Catatan tanpa ruang lingkup.'])
            ->assertSessionHasErrors('ruang_lingkup');

        $validasi = $this->createPembahasan($mitra, 'direktorat_dikdas', ['tahap' => Pembahasan::TAHAP_VALIDASI]);
        $this->actingAs($admin)
            ->patch("/pembahasan/{$validasi->id}/advance", ['catatan' => 'Catatan tanpa nomor PKS.'])
            ->assertSessionHasErrors('nomor_pks');

        $penandatanganan = $this->createPembahasan($mitra, 'direktorat_dikdas', ['tahap' => Pembahasan::TAHAP_PENANDATANGANAN]);
        $this->actingAs($admin)
            ->patch("/pembahasan/{$penandatanganan->id}/advance", ['catatan' => 'Catatan tanpa tanggal tandatangan.'])
            ->assertSessionHasErrors(['tanggal_tandatangan', 'pks_tertandatangan']);
    }
}
