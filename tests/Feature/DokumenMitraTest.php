<?php

namespace Tests\Feature;

use App\Models\DokumenMitra;
use App\Models\Mitra;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DokumenMitraTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        foreach (['super_admin', 'admin', 'mitra'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }
    }

    private function createMitraUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('mitra');

        return $user;
    }

    private function createAdmin(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    /**
     * UploadedFile::fake()->create() menghasilkan file kosong di disk — Medialibrary
     * mendeteksi mime aktual (application/x-empty) dan menolaknya. Pakai konten
     * dengan magic bytes %PDF supaya terdeteksi application/pdf.
     */
    private function fakePdf(string $filename): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($filename, "%PDF-1.4\n%fake pdf untuk test\n");
    }

    private function uploadDokumen(User $user, string $jenis = 'surat_pengajuan', string $filename = 'surat.pdf'): void
    {
        $this->actingAs($user)
            ->post('/mitra/profil/dokumen', [
                'jenis_dokumen' => $jenis,
                'file' => $this->fakePdf($filename),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');
    }

    public function test_mitra_dapat_upload_dokumen(): void
    {
        $user = $this->createMitraUser();

        $this->uploadDokumen($user);

        $dokumen = Mitra::where('user_id', $user->id)->firstOrFail()
            ->dokumens()->where('jenis_dokumen', 'surat_pengajuan')->firstOrFail();

        $this->assertSame('menunggu', $dokumen->status);
        $this->assertTrue($dokumen->wajib);
        $this->assertCount(1, $dokumen->getMedia('file'));
        $this->assertSame('surat.pdf', $dokumen->nama_file);
    }

    public function test_upload_ulang_mengganti_file_lama(): void
    {
        $user = $this->createMitraUser();

        $this->uploadDokumen($user, 'surat_pengajuan', 'surat-v1.pdf');
        $this->uploadDokumen($user, 'surat_pengajuan', 'surat-v2.pdf');

        $mitra = Mitra::where('user_id', $user->id)->firstOrFail();
        $this->assertSame(1, $mitra->dokumens()->count());

        $dokumen = $mitra->dokumens()->firstOrFail();
        $this->assertCount(1, $dokumen->getMedia('file'));
        $this->assertSame('surat-v2.pdf', $dokumen->nama_file);
    }

    public function test_resource_dokumen_tetap_berisi_field_kontrak(): void
    {
        $user = $this->createMitraUser();
        $this->uploadDokumen($user);

        $this->withoutVite();
        $this->actingAs($user)
            ->get('/mitra/profil')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('mitra/profil/edit')
                ->where('mitra.dokumens.0.nama_file', 'surat.pdf')
                ->where('mitra.dokumens.0.file_type', 'application/pdf')
                ->has('mitra.dokumens.0.file_url')
                ->has('mitra.dokumens.0.file_size_formatted')
            );
    }

    public function test_mitra_dapat_hapus_dokumen_belum_diterima(): void
    {
        $user = $this->createMitraUser();
        $this->uploadDokumen($user);

        $dokumen = Mitra::where('user_id', $user->id)->firstOrFail()->dokumens()->firstOrFail();

        $this->actingAs($user)
            ->delete("/mitra/profil/dokumen/{$dokumen->id}")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSoftDeleted('dokumen_mitras', ['id' => $dokumen->id]);
        $this->assertSame(0, $dokumen->media()->count());
    }

    public function test_dokumen_diterima_tidak_bisa_dihapus(): void
    {
        $user = $this->createMitraUser();
        $this->uploadDokumen($user);

        $dokumen = Mitra::where('user_id', $user->id)->firstOrFail()->dokumens()->firstOrFail();
        $dokumen->update(['status' => 'diterima']);

        $this->actingAs($user)
            ->delete("/mitra/profil/dokumen/{$dokumen->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertNull($dokumen->fresh()->deleted_at);
        $this->assertCount(1, $dokumen->fresh()->getMedia('file'));
    }

    public function test_validasi_upload_menolak_file_tidak_valid(): void
    {
        $user = $this->createMitraUser();

        $this->actingAs($user)
            ->post('/mitra/profil/dokumen', [
                'jenis_dokumen' => 'surat_pengajuan',
                'file' => UploadedFile::fake()->create('virus.exe', 100, 'application/octet-stream'),
            ])
            ->assertSessionHasErrors('file');

        $this->actingAs($user)
            ->post('/mitra/profil/dokumen', [
                'jenis_dokumen' => 'surat_pengajuan',
                'file' => UploadedFile::fake()->create('besar.pdf', 20_480, 'application/pdf'),
            ])
            ->assertSessionHasErrors('file');

        $this->actingAs($user)
            ->post('/mitra/profil/dokumen', [
                'jenis_dokumen' => 'jenis_ngawur',
                'file' => $this->fakePdf('surat.pdf'),
            ])
            ->assertSessionHasErrors('jenis_dokumen');

        $this->assertSame(0, DokumenMitra::count());
    }

    public function test_admin_dapat_review_dokumen(): void
    {
        $user = $this->createMitraUser();
        $this->uploadDokumen($user);

        $mitra = Mitra::where('user_id', $user->id)->firstOrFail();
        $dokumen = $mitra->dokumens()->firstOrFail();

        $this->actingAs($this->createAdmin())
            ->post("/admin/mitras/{$mitra->id}/dokumens/{$dokumen->id}/review", [
                'status' => 'diterima',
                'catatan' => 'Dokumen lengkap.',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame('diterima', $dokumen->fresh()->status);
    }
}
