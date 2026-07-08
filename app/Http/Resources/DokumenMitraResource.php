<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class DokumenMitraResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mitra_id' => $this->mitra_id,
            'jenis_dokumen' => $this->jenis_dokumen,
            'wajib' => $this->wajib,
            'nama_file' => $this->nama_file,
            'file_path' => $this->file_path,
            'file_url' => Storage::disk('public')->url($this->file_path),
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'file_size_formatted' => $this->file_size_formatted,
            'status' => $this->status,
            'catatan' => $this->catatan,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
