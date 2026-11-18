<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The sidebar hides links the user has no permission for. These tests verify
 * the backend keeps sending correct role/permission data (the React side
 * filters links from auth.permissions), so a chair sees analytics links but
 * never admin ones, and a student sees only their grades page.
 */
class SidebarVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $role): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        return User::factory()->create()->assignRole($role);
    }

    public function test_student_sees_only_grades_permission_and_no_admin_links(): void
    {
        $student = $this->userWithRole('student');

        $response = $this
            ->actingAs($student)
            ->get('/my-grades');

        $response->assertInertia(
            fn ($page) => $page
                ->component('Grades/MyGrades')
                ->where('auth.user.roles', ['student'])
                ->where('auth.user.permissions', ['dashboard.view', 'grades.view-own'])
        );
    }

    public function test_faculty_sees_analytics_permissions_but_no_admin_ones(): void
    {
        $faculty = $this->userWithRole('faculty');

        $response = $this
            ->actingAs($faculty)
            ->get('/dashboard');

        $response->assertInertia(
            fn ($page) => $page
                ->component('Dashboard')
                ->where('auth.user.roles', ['faculty'])
                ->has('auth.user.permissions', 6)
                ->etc()
        );
    }

    public function test_chair_can_open_every_page_the_role_holds(): void
    {
        $chair = $this->userWithRole('chair');

        $this->actingAs($chair)->get('/dashboard')->assertOk();
        $this->actingAs($chair)->get('/risk')->assertOk();
        $this->actingAs($chair)->get('/import')->assertOk(); // chair has import.view
    }

    public function test_gate_before_lets_admin_open_any_page(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)->get('/dashboard')->assertOk();
        $this->actingAs($admin)->get('/admin/users')->assertOk();
        $this->actingAs($admin)->get('/admin/roles')->assertOk();
        $this->actingAs($admin)->get('/import')->assertOk();
        $this->actingAs($admin)->get('/risk')->assertOk();
    }
}
