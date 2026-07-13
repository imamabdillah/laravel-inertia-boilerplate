<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('users.create');
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'distinct', 'exists:roles,name'],
            'direktorat_id' => [
                Rule::requiredIf(fn () => in_array('admin_direktorat', $this->input('roles', []))),
                'nullable',
                'exists:ref_direktorats,id',
            ],
            'upt_id' => [
                Rule::requiredIf(fn () => in_array('admin_upt', $this->input('roles', []))),
                'nullable',
                'exists:ref_upts,id',
            ],
            'is_active' => ['boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $roles = $this->input('roles', []);

            if (in_array('admin_direktorat', $roles, true) && in_array('admin_upt', $roles, true)) {
                $validator->errors()->add('roles', 'User tidak bisa menjadi admin direktorat dan admin UPT sekaligus.');
            }
        });
    }
}
