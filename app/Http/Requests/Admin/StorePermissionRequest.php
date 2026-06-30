<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('permissions.create');
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => strtolower(trim($this->name ?? '')),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:permissions,name', 'regex:/^[a-z0-9_\-]+\.[a-z0-9_\-]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex' => 'Format: resource.action (contoh: users.view)',
        ];
    }
}
