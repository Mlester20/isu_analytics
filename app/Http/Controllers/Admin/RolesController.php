<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Role management: admins can view/edit permissions for roles.
 * The admin role is locked — its permissions cannot be edited via PATCH.
 */
class RolesController extends Controller
{
    public function index(): Response
    {
        // Custom sort order so admin comes first, followed by chair, faculty, student
        $order = ['admin' => 1, 'chair' => 2, 'faculty' => 3, 'student' => 4];

        $roles = Role::with('permissions:id,name')
            ->get(['id', 'name'])
            ->sortBy(fn (Role $r) => $order[$r->name] ?? 99)
            ->values()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'is_admin' => $role->name === 'admin',
                'permissions' => $role->permissions->pluck('name')->values()->all(),
                'permission_ids' => $role->permissions->pluck('id')->values()->all(),
                'users_count' => $role->users()->count(),
            ]);

        $allPermissions = Permission::orderBy('name')->get(['id', 'name'])
            ->map(fn (Permission $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'module' => explode('.', $p->name)[0],
            ]);

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'allPermissions' => $allPermissions,
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        abort_if($role->name === 'admin', 403, 'The admin role cannot be edited.');

        $validated = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()
            ->route('admin.roles.index')
            ->with('success', "Permissions updated for the {$role->name} role.");
    }
}
