<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Mitra
 */
class MitraResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nama_lembaga' => $this->nama_lembaga,
            'jenis_lembaga' => $this->jenis_lembaga,
            'jenis_lembaga_lainnya' => $this->jenis_lembaga_lainnya,
            'bidang_kerja' => $this->bidang_kerja,
            'jenjang' => $this->jenjang ?? [],
            'wilayah' => $this->wilayah ?? [],
            'upt' => $this->upt ?? [],
            'deskripsi' => $this->deskripsi,
            'alamat' => $this->alamat,
            'kota' => $this->kota,
            'provinsi' => $this->provinsi,
            'kode_pos' => $this->kode_pos,
            'website' => $this->website,
            'telepon' => $this->telepon,
            'email_lembaga' => $this->email_lembaga,
            'pic_nama' => $this->pic_nama,
            'pic_jabatan' => $this->pic_jabatan,
            'pic_telepon' => $this->pic_telepon,
            'pic_email' => $this->pic_email,
            'nomor_akta' => $this->nomor_akta,
            'nomor_nib' => $this->nomor_nib,
            'nomor_npwp' => $this->nomor_npwp,
            'status' => $this->status,
            'catatan_admin' => $this->catatan_admin,
            'verified_at' => $this->verified_at?->toDateTimeString(),
            'logo' => $this->logo,
            'is_profile_complete' => $this->is_profile_complete,
            'is_documents_complete' => $this->is_documents_complete,
            'is_all_dokumen_verified' => $this->is_all_dokumen_verified,
            'can_submit' => $this->can_submit,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'verified_by' => $this->whenLoaded('verifiedBy', fn () => $this->verifiedBy ? [
                'id' => $this->verifiedBy->id,
                'name' => $this->verifiedBy->name,
            ] : null),
            'dokumens' => DokumenMitraResource::collection($this->whenLoaded('dokumens')),
            'suggested_pelaksana' => $this->suggested_pelaksana,
            'latest_audiensi' => new AudiensiResource($this->whenLoaded('latestAudiensi')),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
