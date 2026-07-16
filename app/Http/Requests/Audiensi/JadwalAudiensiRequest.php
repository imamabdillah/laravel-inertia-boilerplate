<?php

namespace App\Http\Requests\Audiensi;

use App\Models\Audiensi;
use Illuminate\Foundation\Http\FormRequest;

class JadwalAudiensiRequest extends FormRequest
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
            'jadwal' => ['required', 'date'],
            'moda' => ['required', 'in:daring,luring'],
            'lokasi' => ['required', 'string', 'max:255'],
        ];
    }
}
