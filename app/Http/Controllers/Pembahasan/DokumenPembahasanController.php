<?php

namespace App\Http\Controllers\Pembahasan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pembahasan\UploadDokumenPembahasanRequest;
use App\Models\Pembahasan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DokumenPembahasanController extends Controller
{
    public function store(UploadDokumenPembahasanRequest $request, Pembahasan $pembahasan): RedirectResponse
    {
        if ($pembahasan->status !== 'berjalan') {
            return back()->with('error', 'Pembahasan sudah selesai/dibatalkan.');
        }

        $pembahasan->addMediaFromRequest('file')
            ->withCustomProperties([
                'tahap' => $pembahasan->tahap,
                'uploaded_by' => auth()->id(),
                'uploaded_by_name' => auth()->user()->name,
                'label' => $request->label,
            ])
            ->toMediaCollection($request->jenis);

        activity()->causedBy(auth()->user())->on($pembahasan->mitra)
            ->log("dokumen_pembahasan_{$request->jenis}_uploaded");

        return back()->with('success', 'Dokumen berhasil diupload.');
    }

    public function destroy(Request $request, Pembahasan $pembahasan, int $media): RedirectResponse
    {
        abort_unless($pembahasan->canAdvanceTahap($request->user()), 403);

        if ($pembahasan->status !== 'berjalan') {
            return back()->with('error', 'Pembahasan sudah selesai/dibatalkan.');
        }

        // Scoping: 404 kalau media bukan milik pembahasan ini.
        $mediaModel = $pembahasan->media()->where('id', $media)->firstOrFail();
        $mediaModel->delete();

        activity()->causedBy(auth()->user())->on($pembahasan->mitra)->log('dokumen_pembahasan_deleted');

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }
}
