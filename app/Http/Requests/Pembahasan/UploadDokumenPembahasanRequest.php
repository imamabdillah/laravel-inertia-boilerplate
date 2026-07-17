<?php

namespace App\Http\Requests\Pembahasan;

use App\Models\Pembahasan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadDokumenPembahasanRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Pembahasan $pembahasan */
        $pembahasan = $this->route('pembahasan');

        // Status non-berjalan ditangani controller dengan flash error, bukan 403.
        return $pembahasan->canAdvanceTahap($this->user());
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'jenis' => ['required', Rule::in(Pembahasan::DOKUMEN_JENIS)],
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'],
            'label' => ['nullable', 'string', 'max:255'],
        ];
    }
}
