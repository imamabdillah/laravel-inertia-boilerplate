<?php

namespace App\Http\Resources;

use App\Models\Pembahasan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Pembahasan
 */
class PembahasanResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mitra_id' => $this->mitra_id,
            'audiensi_id' => $this->audiensi_id,
            'pelaksana' => $this->pelaksana,
            'tahap' => $this->tahap,
            'status' => $this->status,
            'ruang_lingkup' => $this->ruang_lingkup,
            'rencana_kerja' => $this->rencana_kerja,
            'nomor_pks' => $this->nomor_pks,
            'tanggal_tandatangan' => $this->tanggal_tandatangan?->toDateString(),
            'catatan' => $this->catatan,
            'completed_by' => $this->whenLoaded('completedBy', fn () => $this->completedBy?->name),
            'can_advance' => $request->user() ? $this->canAdvanceTahap($request->user()) : false,
            'can_batalkan' => $request->user() ? $request->user()->hasAnyRole(['super_admin', 'admin']) : false,
            'can_upload_dokumen' => $request->user() ? $this->canManageDokumen($request->user()) : false,
            'dokumen' => $this->whenLoaded('media', function () use ($request) {
                $media = $this->media;

                // Mitra hanya melihat arsip PKS final — draf internal tidak diekspos.
                if ($request->user()?->hasRole('mitra')) {
                    $media = $media->where('collection_name', 'pks_tertandatangan')->values();
                }

                return MediaResource::collection($media);
            }),
            'mitra' => $this->whenLoaded('mitra', fn () => [
                'id' => $this->mitra->id,
                'nama_lembaga' => $this->mitra->nama_lembaga,
                'pic_nama' => $this->mitra->pic_nama,
                'jenjang' => $this->mitra->jenjang ?? [],
                'wilayah' => $this->mitra->wilayah ?? [],
                'upt' => $this->mitra->upt ?? [],
                'status' => $this->mitra->status,
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
