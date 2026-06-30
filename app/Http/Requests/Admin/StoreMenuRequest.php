<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('menus.create');
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:100'],
            'icon'       => ['nullable', 'string', 'max:50'],
            'route'      => ['nullable', 'string', 'max:200'],
            'permission' => ['nullable', 'string', 'max:100'],
            'parent_id'  => ['nullable', 'integer', 'exists:menus,id'],
            'order'      => ['integer', 'min:0'],
            'is_active'  => ['boolean'],
        ];
    }
}
