<?php

namespace App\Http\Requests\Pembahasan;

use Illuminate\Foundation\Http\FormRequest;

class BatalkanPembahasanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'catatan' => ['required', 'string', 'min:10'],
        ];
    }
}
