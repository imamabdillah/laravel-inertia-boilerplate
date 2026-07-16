<?php

namespace App\Http\Resources;

use App\Models\Audiensi;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Audiensi
 */
class AudiensiResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mitra_id' => $this->mitra_id,
            'pelaksana' => $this->pelaksana,
            'status' => $this->status,
            'jadwal' => $this->jadwal?->toDateTimeString(),
            'moda' => $this->moda,
            'lokasi' => $this->lokasi,
            'hasil' => $this->hasil,
            'catatan_hasil' => $this->catatan_hasil,
            'assigned_at' => $this->assigned_at?->toDateTimeString(),
            'assigned_by' => $this->whenLoaded('assignedBy', fn () => $this->assignedBy?->name),
            'completed_by' => $this->whenLoaded('completedBy', fn () => $this->completedBy?->name),
            'can_execute' => $request->user() ? $this->canBeExecutedBy($request->user()) : false,
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
