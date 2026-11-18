<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Only admins may create users (route is also protected, this is a 2nd gate).
     */
    public function authorize(): bool
    {
        return $this->user()->can('users.manage');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', Password::defaults()],
            'role' => ['required', Rule::exists('roles', 'name')],
            'is_active' => ['sometimes', 'boolean'],
            'position' => ['required_if:role,faculty,chair', 'nullable', 'string', 'max:255'],
            'department' => ['required_if:role,faculty,chair', 'nullable', 'string', 'max:255'],
            'school_id' => ['required_if:role,student', 'nullable', 'string', 'max:255', 'unique:users,school_id'],
            'program' => ['required_if:role,student', 'nullable', 'string', 'max:255'],
            'year_level' => ['required_if:role,student', 'nullable', 'integer', 'min:1', 'max:4'],
        ];
    }
}
