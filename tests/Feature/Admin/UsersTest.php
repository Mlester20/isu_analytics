<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsersTest extends TestCase
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

    public function test_admin_can_access_admin_users_page(): void
    {
        $admin = $this->userWithRole('admin');

        $response = $this
            ->actingAs($admin)
            ->get('/admin/users');

        $response->assertOk();
    }

    public function test_faculty_gets_403_on_admin_users_page(): void
    {
        $faculty = $this->userWithRole('faculty');

        $response = $this
            ->actingAs($faculty)
            ->get('/admin/users');

        $response->assertForbidden();
    }

    public function test_student_gets_403_on_admin_users_page(): void
    {
        $student = $this->userWithRole('student');

        $response = $this
            ->actingAs($student)
            ->get('/admin/users');

        $response->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get('/admin/users');

        $response->assertRedirect(route('login'));
    }

    public function test_admin_can_create_a_user(): void
    {
        $admin = $this->userWithRole('admin');

        $response = $this
            ->actingAs($admin)
            ->post('/admin/users', [
                'name' => 'New Person',
                'email' => 'new.person@example.com',
                'password' => 'password',
                'role' => 'faculty',
                'is_active' => true,
                'position' => 'Instructor I',
                'department' => 'Computer Science',
            ]);

        $response->assertRedirect(route('admin.users.index'));

        $user = User::where('email', 'new.person@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('faculty'));
        $this->assertTrue($user->is_active);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $admin = $this->userWithRole('admin');

        $response = $this
            ->actingAs($admin)
            ->delete("/admin/users/{$admin->id}");

        $response->assertSessionHasErrors('user');
        $this->assertNotNull($admin->fresh());
    }

    public function test_admin_cannot_demote_themselves(): void
    {
        $admin = $this->userWithRole('admin');

        $response = $this
            ->actingAs($admin)
            ->patch("/admin/users/{$admin->id}", [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'student',
                'is_active' => true,
                'school_id' => 'STU-001',
                'program' => 'Computer Science',
                'year_level' => 1,
            ]);

        $response->assertSessionHasErrors('role');
        $this->assertTrue($admin->fresh()->hasRole('admin'));
    }

    public function test_admin_cannot_deactivate_themselves(): void
    {
        $admin = $this->userWithRole('admin');

        $response = $this
            ->actingAs($admin)
            ->patch("/admin/users/{$admin->id}", [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'admin',
                'is_active' => false,
            ]);

        $response->assertSessionHasErrors('role');
        $this->assertTrue($admin->fresh()->is_active);
    }

    public function test_deactivated_user_cannot_log_in(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create([
            'is_active' => false,
        ])->assignRole('student');

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_new_registrations_default_to_student_role(): void
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $response = $this->post('/register', [
            'name' => 'Self Registered',
            'email' => 'self.registered@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('grades.own', absolute: false));

        $user = User::where('email', 'self.registered@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('student'));
    }

    public function test_student_redirected_to_own_grades_after_login(): void
    {
        $student = $this->userWithRole('student');

        $response = $this->post('/login', [
            'email' => $student->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('grades.own', absolute: false));
    }

    public function test_faculty_redirected_to_dashboard_after_login(): void
    {
        $faculty = $this->userWithRole('faculty');

        $response = $this->post('/login', [
            'email' => $faculty->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_faculty_can_access_import_page(): void
    {
        $faculty = $this->userWithRole('faculty');

        $this
            ->actingAs($faculty)
            ->get('/import')
            ->assertOk();
    }

    public function test_student_gets_403_on_import_page(): void
    {
        $student = $this->userWithRole('student');

        $this
            ->actingAs($student)
            ->get('/import')
            ->assertForbidden();
    }
}
