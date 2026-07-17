<?php

namespace App\Http\Controllers\Mitra;

use App\Http\Controllers\Controller;
use App\Http\Resources\MitraResource;
use App\Http\Resources\PembahasanHistoryResource;
use App\Models\Audiensi;
use App\Models\Mitra;
use App\Models\Pembahasan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgresController extends Controller
{
    /**
     * Halaman read-only "Progres Kerja Sama" untuk mitra: status pengajuan,
     * audiensi terakhir, stepper pembahasan, dan arsip dokumen (PKS saja —
     * filter di PembahasanResource).
     */
    public function __invoke(Request $request): Response
    {
        $mitra = Mitra::firstOrCreateForUser($request->user());
        $mitra->load([
            'latestAudiensi.completedBy',
            'latestPembahasan.completedBy',
            'latestPembahasan.histories.completedBy',
            'latestPembahasan.media',
        ]);

        return Inertia::render('mitra/progres', [
            'mitra' => new MitraResource($mitra),
            'histories' => PembahasanHistoryResource::collection(
                $mitra->latestPembahasan?->histories ?? collect()
            ),
            'tahap_labels' => Pembahasan::tahapLabels(),
            'pelaksana_labels' => Audiensi::pelaksanaLabels(),
        ]);
    }
}
