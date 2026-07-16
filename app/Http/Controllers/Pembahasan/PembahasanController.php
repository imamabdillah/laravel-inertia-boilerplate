<?php

namespace App\Http\Controllers\Pembahasan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pembahasan\AdvanceTahapRequest;
use App\Http\Requests\Pembahasan\BatalkanPembahasanRequest;
use App\Http\Resources\PembahasanHistoryResource;
use App\Http\Resources\PembahasanResource;
use App\Models\Pembahasan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PembahasanController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole(['super_admin', 'admin']) || $user->isAudiensiPelaksana(),
            403
        );

        $pembahasans = Pembahasan::with(['mitra', 'completedBy'])
            ->forUser($user)
            ->when($request->search, fn ($q, $s) => $q->whereHas('mitra', function ($q) use ($s) {
                $q->where('nama_lembaga', 'ilike', "%{$s}%")
                    ->orWhere('pic_nama', 'ilike', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->tahap, fn ($q, $t) => $q->where('tahap', $t))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pembahasan/index', [
            'pembahasans' => PembahasanResource::collection($pembahasans),
            'filters' => $request->only(['search', 'status', 'tahap']),
            'tahap_labels' => Pembahasan::tahapLabels(),
            'can_monitor' => $user->hasAnyRole(['super_admin', 'admin']),
        ]);
    }

    public function show(Request $request, Pembahasan $pembahasan): Response
    {
        $user = $request->user();

        abort_unless(
            $user->hasAnyRole(['super_admin', 'admin']) || $user->pelaksanaUnitCode() === $pembahasan->pelaksana,
            403
        );

        $pembahasan->load(['mitra', 'completedBy', 'histories.completedBy']);

        return Inertia::render('pembahasan/show', [
            'pembahasan' => new PembahasanResource($pembahasan),
            'histories' => PembahasanHistoryResource::collection($pembahasan->histories),
            'tahap_labels' => Pembahasan::tahapLabels(),
            'can_monitor' => $user->hasAnyRole(['super_admin', 'admin']),
        ]);
    }

    public function advance(AdvanceTahapRequest $request, Pembahasan $pembahasan): RedirectResponse
    {
        if ($pembahasan->status !== 'berjalan') {
            return back()->with('error', 'Pembahasan sudah selesai/dibatalkan.');
        }

        DB::transaction(function () use ($request, $pembahasan) {
            $completedTahap = $pembahasan->tahap;
            $isFinal = $completedTahap === Pembahasan::TAHAP_PENANDATANGANAN;
            $next = $pembahasan->nextTahap();

            $pembahasan->update([
                'catatan' => $request->catatan,
                'ruang_lingkup' => $request->ruang_lingkup ?? $pembahasan->ruang_lingkup,
                'rencana_kerja' => $request->rencana_kerja ?? $pembahasan->rencana_kerja,
                'nomor_pks' => $request->nomor_pks ?? $pembahasan->nomor_pks,
                'tanggal_tandatangan' => $request->tanggal_tandatangan ?? $pembahasan->tanggal_tandatangan,
                'tahap' => $next ?? $completedTahap,
                'status' => $isFinal ? 'selesai' : 'berjalan',
                'completed_by' => $isFinal ? auth()->id() : $pembahasan->completed_by,
            ]);

            // Penandatanganan selesai = PKS resmi, mitra jadi partner aktif (lihat flow Pelaksanaan).
            if ($isFinal) {
                $pembahasan->mitra->update(['status' => 'aktif']);
            }

            $pembahasan->histories()->create([
                'tahap' => $completedTahap,
                'event' => 'tahap_selesai',
                'catatan' => $request->catatan,
                'ruang_lingkup' => $request->ruang_lingkup,
                'rencana_kerja' => $request->rencana_kerja,
                'nomor_pks' => $request->nomor_pks,
                'tanggal_tandatangan' => $request->tanggal_tandatangan,
                'completed_by' => auth()->id(),
            ]);

            activity()->causedBy(auth()->user())->on($pembahasan->mitra)
                ->log($isFinal ? 'pembahasan_selesai' : "pembahasan_{$completedTahap}_selesai");
        });

        return back()->with('success', 'Tahap pembahasan berhasil diperbarui.');
    }

    public function batalkan(BatalkanPembahasanRequest $request, Pembahasan $pembahasan): RedirectResponse
    {
        if ($pembahasan->status !== 'berjalan') {
            return back()->with('error', 'Pembahasan sudah selesai/dibatalkan.');
        }

        DB::transaction(function () use ($request, $pembahasan) {
            $tahapSaatDibatalkan = $pembahasan->tahap;

            $pembahasan->update([
                'status' => 'dibatalkan',
                'catatan' => $request->catatan,
                'completed_by' => auth()->id(),
            ]);

            $pembahasan->mitra->update([
                'status' => 'ditolak',
                'catatan_admin' => $request->catatan,
            ]);

            $pembahasan->histories()->create([
                'tahap' => $tahapSaatDibatalkan,
                'event' => 'dibatalkan',
                'catatan' => $request->catatan,
                'completed_by' => auth()->id(),
            ]);

            activity()->causedBy(auth()->user())->on($pembahasan->mitra)->log('pembahasan_dibatalkan');
        });

        return back()->with('success', 'Pembahasan dibatalkan.');
    }
}
