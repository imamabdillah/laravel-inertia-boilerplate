<?php

namespace App\Http\Requests\Audiensi;

use App\Models\Audiensi;
use Illuminate\Foundation\Http\FormRequest;

class HasilAudiensiRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Audiensi $audiensi */
        $audiensi = $this->route('audiensi');

        return $audiensi->canBeExecutedBy($this->user());
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'hasil' => ['required', 'in:lanjut,ditolak'],
            'catatan_hasil' => ['required', 'string', 'min:10'],
        ];
    }
}
