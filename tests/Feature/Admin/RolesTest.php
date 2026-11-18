<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Seed roles/permissions and return a user with the given role.
     */
    private function userWithRole(string $role): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        return User::factory()->create()->assignRole($role);
    }

    public function test_admin_can_view_roles_page(): void
    {
        $admin = $this->userWithRole('admin');

        $response = $this
            ->actingAs($admin)
            ->get('/admin/roles');

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Roles/Index')
                ->has('roles', 4) // admin, chair, faculty, student
        );
    }

    public function test_roles_page_includes_all_roles_with_admin_first(): void
    {
        $admin = $this->userWithRole('admin');

        $response = $this
            ->actingAs($admin)
            ->get('/admin/roles');

        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/Roles/Index')
                ->has('roles', 4)
                ->has('roles.0', fn ($role) => $role
                    ->where('name', 'admin')
                    ->where('is_admin', true)
                    ->etc())
        );
    }

    public function test_faculty_cannot_view_roles_page(): void
    {
        $faculty = $this->userWithRole('faculty');

        $response = $this
            ->actingAs($faculty)
            ->get('/admin/roles');

        $response->assertForbidden();
    }

    public function test_student_cannot_view_roles_page(): void
    {
        $student = $this->userWithRole('student');

        $response = $this
            ->actingAs($student)
            ->get('/admin/roles');

        $response->assertForbidden();
    }

    public function test_admin_can_update_role_permissions(): void
    {
        $admin = $this->userWithRole('admin');
        $role = Role::where('name', 'faculty')->first();

        // Give faculty a permission it does not start with.
        $reportsId = Permission::where('name', 'reports.export')->value('id');

        $response = $this
            ->actingAs($admin)
            ->patch("/admin/roles/{$role->id}/permissions", [
                'permissions' => [$reportsId],
            ]);

        $response->assertRedirect(route('admin.roles.index'));
        $this->assertTrue($role->fresh()->hasPermissionTo('reports.export'));
        $this->assertFalse($role->fresh()->hasPermissionTo('risk.view'));
    }

    public function test_update_rejects_unknown_permission_ids(): void
    {
        $admin = $this->userWithRole('admin');
        $role = Role::where('name', 'student')->first();
        $countBefore = $role->permissions()->count();

        $response = $this
            ->actingAs($admin)
            ->patch("/admin/roles/{$role->id}/permissions", [
                'permissions' => [999999],
            ]);

        // Validation fails, so nothing is synced and the role keeps
        // its existing permissions untouched.
        $response->assertSessionHasErrors('permissions.0');
        $this->assertSame($countBefore, $role->fresh()->permissions()->count());
    }

    public function test_admin_role_cannot_be_edited(): void
    {
        $admin = $this->userWithRole('admin');
        $adminRole = Role::where('name', 'admin')->first();

        $response = $this
            ->actingAs($admin)
            ->patch("/admin/roles/{$adminRole->id}/permissions", [
                'permissions' => [],
            ]);

        $response->assertForbidden();
    }

    public function test_faculty_cannot_update_role_permissions(): void
    {
        $faculty = $this->userWithRole('faculty');
        $role = Role::where('name', 'student')->first();

        $response = $this
            ->actingAs($faculty)
            ->patch("/admin/roles/{$role->id}/permissions", [
                'permissions' => [],
            ]);

        $response->assertForbidden();
    }
}
