<?php

namespace App\Http\Requests\Mitra;

use App\Models\Mitra;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMitraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama_lembaga' => ['required', 'string', 'max:255'],
            'jenis_lembaga' => ['required', 'in:perguruan_tinggi,lembaga_pelatihan,perusahaan,lsm,instansi_pemerintah,lainnya'],
            'jenis_lembaga_lainnya' => ['required_if:jenis_lembaga,lainnya', 'nullable', 'string', 'max:255'],
            'bidang_kerja' => ['required', 'string', 'max:255'],
            'jenjang' => ['nullable', 'array'],
            'jenjang.*' => [Rule::in(Mitra::JENJANG_OPTIONS)],
            'wilayah' => ['nullable', 'array'],
            'wilayah.*' => [Rule::in(Mitra::WILAYAH_OPTIONS)],
            'upt' => ['nullable', 'array'],
            'upt.*' => [Rule::in(Mitra::UPT_OPTIONS)],
            'deskripsi' => ['nullable', 'string'],
            'alamat' => ['nullable', 'string'],
            'kota' => ['nullable', 'string', 'max:100'],
            'provinsi' => ['nullable', 'string', 'max:100'],
            'kode_pos' => ['nullable', 'string', 'max:10'],
            'website' => ['nullable', 'url', 'max:255'],
            'telepon' => ['required', 'string', 'max:20'],
            'email_lembaga' => ['required', 'email', 'max:255'],
            'pic_nama' => ['required', 'string', 'max:255'],
            'pic_jabatan' => ['required', 'string', 'max:255'],
            'pic_telepon' => ['required', 'string', 'max:20'],
            'pic_email' => ['required', 'email', 'max:255'],
            'nomor_akta' => ['nullable', 'string', 'max:100'],
            'nomor_nib' => ['nullable', 'string', 'max:100'],
            'nomor_npwp' => ['nullable', 'string', 'max:30'],
        ];
    }
}
