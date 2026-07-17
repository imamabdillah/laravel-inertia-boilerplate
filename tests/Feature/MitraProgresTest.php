<?php

namespace Tests\Feature;

use App\Models\Mitra;
use App\Models\Pembahasan;
use App\Models\RefDirektorat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MitraProgresTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        foreach (['super_admin', 'admin', 'mitra', 'admin_direktorat', 'admin_upt'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        RefDirektorat::firstOrCreate(['code' => 'direktorat_dikdas'], ['name' => 'Direktorat Dikdas', 'order' => 1, 'is_active' => true]);
    }

    /** @return array{0: User, 1: Mitra} */
    private function createMitraWithUser(): array
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        $mitra = Mitra::create([
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
        ]);

        return [$user, $mitra];
    }

    private function fakePdf(string $filename = 'dokumen.pdf'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($filename, "%PDF-1.4\n%fake pdf untuk test\n");
    }

    public function test_mitra_dapat_melihat_halaman_progres(): void
    {
        [$user] = $this->createMitraWithUser();

        $this->withoutVite();
        $this->actingAs($user)
            ->get('/mitra/progres')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->component('mitra/progres'));
    }

    public function test_progres_menampilkan_audiensi_dan_pembahasan_terakhir(): void
    {
        [$user, $mitra] = $this->createMitraWithUser();

        $mitra->audiensis()->create([
            'pelaksana' => 'direktorat_dikdas',
            'status' => 'selesai',
            'jadwal' => '2026-07-10 10:00:00',
            'moda' => 'daring',
            'hasil' => 'lanjut',
        ]);

        $pembahasan = $mitra->pembahasans()->create([
            'pelaksana' => 'direktorat_dikdas',
            'tahap' => Pembahasan::TAHAP_LANJUTAN,
            'status' => 'berjalan',
        ]);
        $pembahasan->histories()->create(['tahap' => 'awal', 'event' => 'dimulai']);
        $pembahasan->histories()->create(['tahap' => 'awal', 'event' => 'tahap_selesai']);

        $this->withoutVite();
        $this->actingAs($user)
            ->get('/mitra/progres')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('mitra/progres')
                ->where('mitra.latest_audiensi.hasil', 'lanjut')
                ->where('mitra.latest_pembahasan.tahap', 'lanjutan')
                ->has('histories', 2)
            );
    }

    public function test_mitra_hanya_melihat_dokumen_pks(): void
    {
        [$user, $mitra] = $this->createMitraWithUser();

        $pembahasan = $mitra->pembahasans()->create([
            'pelaksana' => 'direktorat_dikdas',
            'tahap' => Pembahasan::TAHAP_PENANDATANGANAN,
            'status' => 'berjalan',
        ]);
        $pembahasan->addMedia($this->fakePdf('draf.pdf'))->toMediaCollection('draf_naskah');
        $pembahasan->addMedia($this->fakePdf('pks-final.pdf'))->toMediaCollection('pks_tertandatangan');

        $this->withoutVite();
        $this->actingAs($user)
            ->get('/mitra/progres')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('mitra.latest_pembahasan.dokumen', 1)
                ->where('mitra.latest_pembahasan.dokumen.0.collection', 'pks_tertandatangan')
                ->where('mitra.latest_pembahasan.dokumen.0.nama_file', 'pks-final.pdf')
            );
    }

    public function test_role_lain_tidak_bisa_akses_progres(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin)->get('/mitra/progres')->assertForbidden();
    }

    public function test_progres_tanpa_pembahasan_tetap_tampil(): void
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        $this->withoutVite();
        $this->actingAs($user)
            ->get('/mitra/progres')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('mitra/progres')
                ->where('mitra.latest_audiensi', null)
                ->where('mitra.latest_pembahasan', null)
            );
    }
}
