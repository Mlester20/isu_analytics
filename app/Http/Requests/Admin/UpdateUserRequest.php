<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Only admins may edit users (route is also protected, this is a 2nd gate).
     */
    public function authorize(): bool
    {
        return $this->user()->can('users.manage');
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'lowercase', 'email', 'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            // Optional on update: blank/absent keeps the current password.
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::exists('roles', 'name')],
            'is_active' => ['sometimes', 'boolean'],
            'position' => ['required_if:role,faculty,chair', 'nullable', 'string', 'max:255'],
            'department' => ['required_if:role,faculty,chair', 'nullable', 'string', 'max:255'],
            'school_id' => [
                'required_if:role,student', 'nullable', 'string', 'max:255',
                Rule::unique('users', 'school_id')->ignore($user->id),
            ],
            'program' => ['required_if:role,student', 'nullable', 'string', 'max:255'],
            'year_level' => ['required_if:role,student', 'nullable', 'integer', 'min:1', 'max:4'],
        ];
    }
}
