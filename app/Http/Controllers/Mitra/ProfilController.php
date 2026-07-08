<?php

namespace App\Http\Controllers\Mitra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mitra\UpdateMitraRequest;
use App\Http\Resources\MitraResource;
use App\Models\DokumenMitra;
use App\Models\Mitra;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProfilController extends Controller
{
    private function getMitraForAuth(): Mitra
    {
        return Mitra::firstOrCreate(
            ['user_id' => auth()->id()],
            [
                'nama_lembaga' => '',
                'jenis_lembaga' => 'lainnya',
                'bidang_kerja' => '',
                'telepon' => '',
                'email_lembaga' => '',
                'pic_nama' => '',
                'pic_jabatan' => '',
                'pic_telepon' => '',
                'pic_email' => '',
            ]
        );
    }

    public function show(): Response
    {
        $mitra = $this->getMitraForAuth();
        $mitra->load('dokumens');

        return Inertia::render('mitra/profil/edit', [
            'mitra' => new MitraResource($mitra),
            'dokumen_wajib' => Mitra::DOKUMEN_WAJIB,
            'tag_options' => [
                'jenjang' => Mitra::JENJANG_OPTIONS,
                'wilayah' => Mitra::WILAYAH_OPTIONS,
                'upt' => Mitra::UPT_OPTIONS,
            ],
        ]);
    }

    public function update(UpdateMitraRequest $request): RedirectResponse
    {
        $mitra = $this->getMitraForAuth();

        $mitra->update($request->validated());

        activity()->causedBy(auth()->user())->on($mitra)->log('updated');

        return back()->with('success', 'Profil mitra berhasil disimpan.');
    }

    public function uploadDokumen(Request $request): RedirectResponse
    {
        \Log::info('DEBUG upload', [
            'jenis_dokumen' => $request->input('jenis_dokumen'),
            'has_file' => $request->hasFile('file'),
            'file_valid' => $request->hasFile('file') ? $request->file('file')->isValid() : null,
            'file_error' => $request->hasFile('file') ? $request->file('file')->getError() : null,
            'file_mime' => $request->hasFile('file') ? $request->file('file')->getMimeType() : null,
            'file_ext' => $request->hasFile('file') ? $request->file('file')->getClientOriginalExtension() : null,
            'file_size' => $request->hasFile('file') ? $request->file('file')->getSize() : null,
        ]);

        try {
            $request->validate([
                'jenis_dokumen' => ['required', 'in:surat_pengajuan,proposal_kerja_sama,dokumen_legalitas,profil_perusahaan'],
                'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
            ]);
        } catch (ValidationException $e) {
            \Log::info('DEBUG upload validation failed', $e->errors());
            throw $e;
        }

        $mitra = $this->getMitraForAuth();

        $file = $request->file('file');
        $jenis = $request->jenis_dokumen;
        $wajib = in_array($jenis, Mitra::DOKUMEN_WAJIB);
        $path = $file->store("dokumen-mitra/{$mitra->id}", 'public');

        $existing = $mitra->dokumens()->where('jenis_dokumen', $jenis)->first();

        if ($existing && $existing->status !== 'diterima') {
            Storage::disk('public')->delete($existing->file_path);
            $existing->update([
                'nama_file' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'status' => 'menunggu',
                'catatan' => null,
            ]);
            $dokumen = $existing;
        } else {
            $dokumen = $mitra->dokumens()->create([
                'jenis_dokumen' => $jenis,
                'wajib' => $wajib,
                'nama_file' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'status' => 'menunggu',
            ]);
        }

        activity()->causedBy(auth()->user())->on($dokumen)->log('uploaded');

        return back()->with('success', 'Dokumen berhasil diupload.');
    }

    public function deleteDokumen(DokumenMitra $dokumen): RedirectResponse
    {
        $mitra = $this->getMitraForAuth();

        if ($dokumen->mitra_id !== $mitra->id) {
            abort(403);
        }

        if ($dokumen->status === 'diterima') {
            return back()->with('error', 'Dokumen yang sudah diterima tidak bisa dihapus.');
        }

        Storage::disk('public')->delete($dokumen->file_path);
        $dokumen->delete();

        activity()->causedBy(auth()->user())->on($mitra)->log('dokumen_deleted');

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }

    public function submit(): RedirectResponse
    {
        $mitra = $this->getMitraForAuth();
        $mitra->load('dokumens');

        if (! $mitra->can_submit) {
            $missing = [];

            if (! $mitra->is_profile_complete) {
                $missing[] = 'Data profil belum lengkap';
            }

            if (! $mitra->is_documents_complete) {
                $missingDocs = [];
                $uploaded = $mitra->dokumens
                    ->whereNotIn('status', ['ditolak'])
                    ->pluck('jenis_dokumen')
                    ->all();

                foreach (Mitra::DOKUMEN_WAJIB as $jenis) {
                    if (! in_array($jenis, $uploaded)) {
                        $missingDocs[] = str_replace('_', ' ', $jenis);
                    }
                }

                if ($missingDocs) {
                    $missing[] = 'Dokumen wajib belum lengkap: '.implode(', ', $missingDocs);
                }
            }

            return back()->with('error', 'Lengkapi data dan dokumen wajib dulu: '.implode('; ', $missing));
        }

        if ($mitra->status !== 'draft') {
            return back()->with('error', 'Profil sudah pernah disubmit.');
        }

        $mitra->update(['status' => 'menunggu_verifikasi']);

        activity()->causedBy(auth()->user())->on($mitra)->log('submitted');

        return back()->with('success', 'Profil berhasil disubmit untuk verifikasi.');
    }
}
