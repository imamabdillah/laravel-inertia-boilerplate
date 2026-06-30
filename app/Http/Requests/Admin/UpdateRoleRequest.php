<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('roles.edit');
    }

    public function rules(): array
    {
        $roleId = $this->route('role')->id;

        return [
            'name' => ['required', 'string', 'max:100', "unique:roles,name,{$roleId}", 'regex:/^[a-z0-9_]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Role name hanya boleh huruf kecil, angka, dan underscore.',
        ];
    }
}
