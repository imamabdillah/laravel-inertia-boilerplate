<?php

namespace Tests\Feature;

use App\Models\Mitra;
use App\Models\Pembahasan;
use App\Models\RefDirektorat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DokumenPembahasanTest extends TestCase
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

    private function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function createPelaksana(string $code = 'direktorat_dikdas'): User
    {
        $direktorat = RefDirektorat::firstOrCreate(['code' => $code], ['name' => $code, 'order' => 1, 'is_active' => true]);
        $user = User::factory()->create();
        $user->assignRole('admin_direktorat');
        $user->update(['direktorat_id' => $direktorat->id]);

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

    private function createPembahasan(Mitra $mitra, array $attributes = []): Pembahasan
    {
        return $mitra->pembahasans()->create(array_merge([
            'pelaksana' => 'direktorat_dikdas',
            'tahap' => Pembahasan::TAHAP_AWAL,
            'status' => 'berjalan',
        ], $attributes));
    }

    /**
     * UploadedFile::fake()->create() menghasilkan file kosong — Medialibrary tolak
     * mime application/x-empty. Pakai konten ber-magic-bytes %PDF.
     */
    private function fakePdf(string $filename = 'dokumen.pdf'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($filename, "%PDF-1.4\n%fake pdf untuk test\n");
    }

    public function test_pelaksana_dapat_upload_dokumen_di_tahap_direktorat(): void
    {
        $pembahasan = $this->createPembahasan($this->createMitra());
        $pelaksana = $this->createPelaksana();

        $this->actingAs($pelaksana)
            ->post("/pembahasan/{$pembahasan->id}/dokumen", [
                'jenis' => 'draf_naskah',
                'file' => $this->fakePdf('draf-naskah.pdf'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $media = $pembahasan->getMedia('draf_naskah');
        $this->assertCount(1, $media);
        $this->assertSame('draf-naskah.pdf', $media->first()->file_name);
        $this->assertSame('awal', $media->first()->getCustomProperty('tahap'));
        $this->assertSame($pelaksana->id, $media->first()->getCustomProperty('uploaded_by'));
        $this->assertSame($pelaksana->name, $media->first()->getCustomProperty('uploaded_by_name'));
    }

    public function test_pelaksana_tidak_bisa_upload_di_tahap_setditjen(): void
    {
        $pembahasan = $this->createPembahasan($this->createMitra(), ['tahap' => Pembahasan::TAHAP_FINALISASI]);

        $this->actingAs($this->createPelaksana())
            ->post("/pembahasan/{$pembahasan->id}/dokumen", [
                'jenis' => 'draf_naskah',
                'file' => $this->fakePdf(),
            ])
            ->assertForbidden();
    }

    public function test_admin_dapat_upload_dan_hapus_dokumen(): void
    {
        $pembahasan = $this->createPembahasan($this->createMitra(), ['tahap' => Pembahasan::TAHAP_VALIDASI]);
        $admin = $this->createAdmin();

        $this->actingAs($admin)
            ->post("/pembahasan/{$pembahasan->id}/dokumen", [
                'jenis' => 'surat_kuasa',
                'file' => $this->fakePdf('surat-kuasa.pdf'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $media = $pembahasan->getMedia('surat_kuasa')->first();
        $this->assertNotNull($media);

        $this->actingAs($admin)
            ->delete("/pembahasan/{$pembahasan->id}/dokumen/{$media->id}")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertCount(0, $pembahasan->fresh()->getMedia('surat_kuasa'));
    }

    public function test_upload_ditolak_jika_pembahasan_tidak_berjalan(): void
    {
        $pembahasan = $this->createPembahasan($this->createMitra(), ['status' => 'selesai']);

        $this->actingAs($this->createAdmin())
            ->post("/pembahasan/{$pembahasan->id}/dokumen", [
                'jenis' => 'lainnya',
                'file' => $this->fakePdf(),
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertCount(0, $pembahasan->getMedia('lainnya'));
    }

    public function test_hapus_dokumen_pembahasan_lain_404(): void
    {
        $mitra = $this->createMitra();
        $pembahasanA = $this->createPembahasan($mitra);
        $pembahasanB = $this->createPembahasan($this->createMitra(['email_lembaga' => 'lain@example.com']));

        $mediaB = $pembahasanB->addMedia($this->fakePdf())->toMediaCollection('draf_naskah');

        $this->actingAs($this->createAdmin())
            ->delete("/pembahasan/{$pembahasanA->id}/dokumen/{$mediaB->id}")
            ->assertNotFound();

        $this->assertCount(1, $pembahasanB->fresh()->getMedia('draf_naskah'));
    }

    public function test_advance_penandatanganan_butuh_pks_tertandatangan(): void
    {
        $mitra = $this->createMitra();
        $pembahasan = $this->createPembahasan($mitra, ['tahap' => Pembahasan::TAHAP_PENANDATANGANAN]);
        $admin = $this->createAdmin();

        $this->actingAs($admin)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Dokumen sudah ditandatangani semua pihak.',
                'tanggal_tandatangan' => '2026-07-20',
            ])
            ->assertSessionHasErrors('pks_tertandatangan');

        $this->assertSame('berjalan', $pembahasan->fresh()->status);

        $pembahasan->addMedia($this->fakePdf('pks-final.pdf'))->toMediaCollection('pks_tertandatangan');

        $this->actingAs($admin)
            ->patch("/pembahasan/{$pembahasan->id}/advance", [
                'catatan' => 'Dokumen PKS telah ditandatangani dan diarsipkan.',
                'tanggal_tandatangan' => '2026-07-20',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $pembahasan->refresh();
        $this->assertSame('selesai', $pembahasan->status);
        $this->assertSame('aktif', $mitra->fresh()->status);
    }

    public function test_validasi_jenis_dan_file(): void
    {
        $pembahasan = $this->createPembahasan($this->createMitra());
        $admin = $this->createAdmin();

        $this->actingAs($admin)
            ->post("/pembahasan/{$pembahasan->id}/dokumen", [
                'jenis' => 'jenis_ngawur',
                'file' => $this->fakePdf(),
            ])
            ->assertSessionHasErrors('jenis');

        $this->actingAs($admin)
            ->post("/pembahasan/{$pembahasan->id}/dokumen", [
                'jenis' => 'draf_naskah',
                'file' => UploadedFile::fake()->create('script.exe', 100, 'application/octet-stream'),
            ])
            ->assertSessionHasErrors('file');

        $this->assertSame(0, $pembahasan->media()->count());
    }
}
