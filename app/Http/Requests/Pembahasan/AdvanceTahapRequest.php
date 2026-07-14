<?php

namespace App\Http\Requests\Pembahasan;

use App\Models\Pembahasan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdvanceTahapRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Pembahasan $pembahasan */
        $pembahasan = $this->route('pembahasan');

        return $pembahasan->canAdvanceTahap($this->user());
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Pembahasan $pembahasan */
        $pembahasan = $this->route('pembahasan');

        return [
            'catatan' => ['required', 'string', 'min:10'],
            'ruang_lingkup' => [Rule::requiredIf($pembahasan->tahap === Pembahasan::TAHAP_AWAL), 'nullable', 'string'],
            'rencana_kerja' => [Rule::requiredIf($pembahasan->tahap === Pembahasan::TAHAP_RK), 'nullable', 'string'],
            'nomor_pks' => [Rule::requiredIf($pembahasan->tahap === Pembahasan::TAHAP_VALIDASI), 'nullable', 'string', 'max:255'],
            'tanggal_tandatangan' => [Rule::requiredIf($pembahasan->tahap === Pembahasan::TAHAP_PENANDATANGANAN), 'nullable', 'date'],
        ];
    }
}
