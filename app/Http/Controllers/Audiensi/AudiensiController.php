<?php

namespace App\Http\Controllers\Audiensi;

use App\Http\Controllers\Controller;
use App\Http\Requests\Audiensi\HasilAudiensiRequest;
use App\Http\Requests\Audiensi\JadwalAudiensiRequest;
use App\Http\Resources\AudiensiResource;
use App\Models\Audiensi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AudiensiController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole(['super_admin', 'admin']) || $user->isAudiensiPelaksana(),
            403
        );

        $audiensis = Audiensi::with(['mitra', 'assignedBy', 'completedBy'])
            ->forUser($user)
            ->when($request->search, fn ($q, $s) => $q->whereHas('mitra', function ($q) use ($s) {
                $q->where('nama_lembaga', 'ilike', "%{$s}%")
                    ->orWhere('pic_nama', 'ilike', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->pelaksana, fn ($q, $p) => $q->where('pelaksana', $p))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('audiensi/index', [
            'audiensis' => AudiensiResource::collection($audiensis),
            'filters' => $request->only(['search', 'status', 'pelaksana']),
            'pelaksana_labels' => Audiensi::pelaksanaLabels(),
            'can_monitor' => $user->hasAnyRole(['super_admin', 'admin']),
        ]);
    }

    public function jadwal(JadwalAudiensiRequest $request, Audiensi $audiensi): RedirectResponse
    {
        if ($audiensi->status === 'selesai') {
            return back()->with('error', 'Audiensi sudah selesai, jadwal tidak dapat diubah.');
        }

        $audiensi->update([
            'jadwal' => $request->jadwal,
            'lokasi' => $request->lokasi,
            'status' => 'dijadwalkan',
        ]);

        activity()->causedBy(auth()->user())->on($audiensi->mitra)->log('audiensi_dijadwalkan');

        return back()->with('success', 'Jadwal audiensi berhasil disimpan.');
    }

    public function hasil(HasilAudiensiRequest $request, Audiensi $audiensi): RedirectResponse
    {
        if ($audiensi->status !== 'dijadwalkan') {
            return back()->with('error', 'Audiensi harus dijadwalkan terlebih dahulu sebelum hasil dicatat.');
        }

        DB::transaction(function () use ($request, $audiensi) {
            $audiensi->update([
                'hasil' => $request->hasil,
                'catatan_hasil' => $request->catatan_hasil,
                'status' => 'selesai',
                'completed_by' => auth()->id(),
            ]);

            // Audiensi ditolak = pengajuan ditolak (lihat flowchart Pengajuan).
            // Hasil 'lanjut' jadi gerbang masuk fase Pembahasan (modul berikutnya).
            if ($request->hasil === 'ditolak') {
                $audiensi->mitra->update([
                    'status' => 'ditolak',
                    'catatan_admin' => $request->catatan_hasil,
                ]);
            }

            activity()->causedBy(auth()->user())->on($audiensi->mitra)
                ->log($request->hasil === 'lanjut' ? 'audiensi_lanjut' : 'audiensi_ditolak');
        });

        return back()->with('success', 'Hasil audiensi berhasil disimpan.');
    }
}
