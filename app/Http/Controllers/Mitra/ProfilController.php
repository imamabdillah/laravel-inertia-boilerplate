<?php

namespace App\Http\Controllers\Mitra;

use App\Http\Controllers\Controller;
use App\Http\Requests\Mitra\UpdateMitraRequest;
use App\Http\Requests\Mitra\UploadDokumenMitraRequest;
use App\Http\Resources\MitraResource;
use App\Models\DokumenMitra;
use App\Models\Mitra;
use App\Models\RefUpt;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProfilController extends Controller
{
    private function getMitraForAuth(): Mitra
    {
        return Mitra::firstOrCreateForUser(auth()->user());
    }

    public function show(): Response
    {
        $mitra = $this->getMitraForAuth();
        $mitra->load('dokumens.media');

        return Inertia::render('mitra/profil/edit', [
            'mitra' => new MitraResource($mitra),
            'dokumen_wajib' => Mitra::DOKUMEN_WAJIB,
            'tag_options' => [
                'jenjang' => Mitra::JENJANG_OPTIONS,
                'wilayah' => Mitra::WILAYAH_OPTIONS,
                'upt' => RefUpt::options(),
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

    public function uploadDokumen(UploadDokumenMitraRequest $request): RedirectResponse
    {
        $mitra = $this->getMitraForAuth();
        $jenis = $request->jenis_dokumen;

        $existing = $mitra->dokumens()->where('jenis_dokumen', $jenis)->first();

        if ($existing && $existing->status !== 'diterima') {
            $existing->update([
                'status' => 'menunggu',
                'catatan' => null,
            ]);
            $dokumen = $existing;
        } else {
            $dokumen = $mitra->dokumens()->create([
                'jenis_dokumen' => $jenis,
                'wajib' => in_array($jenis, Mitra::DOKUMEN_WAJIB),
                'status' => 'menunggu',
            ]);
        }

        // singleFile() di collection 'file' otomatis mengganti file lama.
        $dokumen->addMediaFromRequest('file')->toMediaCollection('file');

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

        $dokumen->clearMediaCollection('file');
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
