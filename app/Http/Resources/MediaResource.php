<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @mixin Media
 */
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'collection' => $this->collection_name,
            'nama_file' => $this->file_name,
            'file_url' => $this->getUrl(),
            'mime_type' => $this->mime_type,
            'file_size' => (int) $this->size,
            'file_size_formatted' => $this->formatSize((int) $this->size),
            'tahap' => $this->getCustomProperty('tahap'),
            'uploaded_by' => $this->getCustomProperty('uploaded_by_name'),
            'label' => $this->getCustomProperty('label'),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }

    // Format sama dengan DokumenMitra::getFileSizeFormattedAttribute().
    private function formatSize(int $bytes): string
    {
        if ($bytes >= 1_048_576) {
            return round($bytes / 1_048_576, 2).' MB';
        }

        if ($bytes >= 1_024) {
            return round($bytes / 1_024, 1).' KB';
        }

        return $bytes.' B';
    }
}
