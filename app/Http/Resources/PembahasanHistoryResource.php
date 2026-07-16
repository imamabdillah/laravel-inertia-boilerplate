<?php

namespace App\Http\Resources;

use App\Models\PembahasanHistory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin PembahasanHistory
 */
class PembahasanHistoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tahap' => $this->tahap,
            'event' => $this->event,
            'catatan' => $this->catatan,
            'ruang_lingkup' => $this->ruang_lingkup,
            'rencana_kerja' => $this->rencana_kerja,
            'nomor_pks' => $this->nomor_pks,
            'tanggal_tandatangan' => $this->tanggal_tandatangan?->toDateString(),
            'completed_by' => $this->whenLoaded('completedBy', fn () => $this->completedBy?->name),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
