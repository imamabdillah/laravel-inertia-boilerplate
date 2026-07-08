<?php

namespace App\Http\Requests\Admin;

use App\Models\Audiensi;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignAudiensiRequest extends FormRequest
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
            'pelaksana' => ['required', 'string', Rule::in(array_keys(Audiensi::pelaksanaLabels()))],
        ];
    }
}
