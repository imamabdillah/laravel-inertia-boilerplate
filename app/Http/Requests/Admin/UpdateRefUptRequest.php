<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRefUptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('ref-upt.edit');
    }

    public function rules(): array
    {
        $refUptId = $this->route('refUpt')->id;

        return [
            'name' => ['required', 'string', 'max:255', "unique:ref_upts,name,{$refUptId}"],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
