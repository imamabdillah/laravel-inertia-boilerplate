<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRefDirektoratRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('ref-direktorat.edit');
    }

    public function rules(): array
    {
        $refDirektoratId = $this->route('refDirektorat')->id;

        return [
            'name' => ['required', 'string', 'max:255', "unique:ref_direktorats,name,{$refDirektoratId}"],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
