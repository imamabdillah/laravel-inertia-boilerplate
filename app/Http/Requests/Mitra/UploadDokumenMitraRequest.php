<?php

namespace App\Http\Requests\Mitra;

use App\Models\Mitra;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadDokumenMitraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'jenis_dokumen' => ['required', Rule::in(Mitra::DOKUMEN_WAJIB)],
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
        ];
    }
}
