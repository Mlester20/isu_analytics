<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * List users with optional search + pagination.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with('roles:id,name')
            ->when($request->string('search')->trim(), function ($query, $search) {
                // Search by name or email, case-insensitive.
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->values()->all(),
                'is_active' => $user->is_active,
                'position' => $user->position,
                'department' => $user->department,
                'school_id' => $user->school_id,
                'program' => $user->program,
                'year_level' => $user->year_level,
            ]),
            'roles' => Role::pluck('name'),
            'filters' => ['search' => $request->string('search')->trim()->toString()],
        ]);
    }


    /**
     * Store a new user.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_active' => $request->boolean('is_active', true),
            'position' => $request->position,
            'department' => $request->department,
            'school_id' => $request->school_id,
            'program' => $request->program,
            'year_level' => $request->year_level,
        ]);

        $user->assignRole($request->role);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User created.');
    }


    /**
     * Update a user (name, email, optional password, role, active flag).
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        // Guard first, before anything is saved: an admin cannot demote or
        // deactivate themselves (otherwise no admin could fix it afterwards).
        if ($user->id === $request->user()->id
            && ($request->role !== 'admin' || $request->boolean('is_active') === false)) {
            return back()->withErrors([
                'role' => 'You cannot change your own role or deactivate your own account.',
            ]);
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->boolean('is_active', true),
            'position' => $request->position,
            'department' => $request->department,
            'school_id' => $request->school_id,
            'program' => $request->program,
            'year_level' => $request->year_level,
        ];

        // Only change the password when a new one was provided.
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        $user->syncRoles([$request->role]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User updated.');
    }

    /**
     * Delete a user. Admins cannot delete themselves.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->withErrors([
                'user' => 'You cannot delete your own account.',
            ]);
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'User deleted.');
    }
}
