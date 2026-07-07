<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MitraResource;
use App\Models\DokumenMitra;
use App\Models\Mitra;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class MitraController extends Controller
{
    public function index(Request $request): Response
    {
        $mitras = Mitra::with('user')
            ->when($request->search, fn ($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('nama_lembaga', 'ilike', "%{$s}%")
                  ->orWhere('pic_nama', 'ilike', "%{$s}%")
                  ->orWhere('email_lembaga', 'ilike', "%{$s}%");
            }))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/mitras/index', [
            'mitras'  => MitraResource::collection($mitras),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Mitra $mitra): Response
    {
        $mitra->load(['user', 'dokumens', 'verifiedBy']);

        $logs = Activity::where('subject_type', Mitra::class)
            ->where('subject_id', $mitra->id)
            ->with('causer')
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(fn ($log) => [
                'id'          => $log->id,
                'description' => $log->description,
                'causer_name' => $log->causer?->name ?? 'System',
                'created_at'  => $log->created_at->toDateTimeString(),
            ]);

        return Inertia::render('admin/mitras/show', [
            'mitra' => new MitraResource($mitra),
            'logs'  => $logs,
        ]);
    }

    public function verify(Request $request, Mitra $mitra): RedirectResponse
    {
        if (! in_array($mitra->status, ['menunggu_verifikasi', 'ditolak'])) {
            return back()->with('error', 'Status mitra tidak valid untuk diverifikasi.');
        }

        if (! $mitra->is_all_dokumen_verified) {
            return back()->with('error', 'Semua dokumen wajib harus diverifikasi (diterima) terlebih dahulu sebelum mitra dapat diverifikasi.');
        }

        $mitra->update([
            'status'      => 'diverifikasi',
            'verified_at' => now(),
            'verified_by' => auth()->id(),
            'catatan_admin' => null,
        ]);

        activity()->causedBy(auth()->user())->on($mitra)->log('verified');

        return back()->with('success', 'Mitra berhasil diverifikasi.');
    }

    public function reject(Request $request, Mitra $mitra): RedirectResponse
    {
        $request->validate([
            'catatan_admin' => ['required', 'string', 'min:10'],
        ]);

        if (! in_array($mitra->status, ['menunggu_verifikasi', 'diverifikasi'])) {
            return back()->with('error', 'Status mitra tidak valid untuk ditolak.');
        }

        $mitra->update([
            'status'        => 'ditolak',
            'catatan_admin' => $request->catatan_admin,
            'verified_by'   => auth()->id(),
        ]);

        activity()->causedBy(auth()->user())->on($mitra)->log('rejected');

        return back()->with('success', 'Mitra berhasil ditolak.');
    }

    public function reviewDokumen(Request $request, Mitra $mitra, DokumenMitra $dokumen): RedirectResponse
    {
        $request->validate([
            'status'  => ['required', 'in:diterima,ditolak'],
            'catatan' => ['nullable', 'string'],
        ]);

        if ($dokumen->mitra_id !== $mitra->id) {
            abort(404);
        }

        $dokumen->update([
            'status'  => $request->status,
            'catatan' => $request->catatan,
        ]);

        $event = $request->status === 'diterima' ? 'dokumen_diterima' : 'dokumen_ditolak';
        activity()->causedBy(auth()->user())->on($mitra)->log($event);

        return back()->with('success', 'Status dokumen berhasil diperbarui.');
    }
}
