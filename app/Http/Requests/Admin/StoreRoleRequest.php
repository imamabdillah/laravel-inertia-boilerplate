<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('roles.create');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:roles,name', 'regex:/^[a-z0-9_]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Role name hanya boleh huruf kecil, angka, dan underscore.',
        ];
    }
}
