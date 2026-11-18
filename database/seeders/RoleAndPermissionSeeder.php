<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * All permission names used by the app.
     * Keep this list in sync with routes/middleware.
     */
    public const PERMISSIONS = [
        'dashboard.view',
        'analytics.view',
        'risk.view',
        'reports.export',
        'import.view',
        'import.upload',
        'users.manage',
        'roles.manage',
        'grades.view-own',
        'grades.view-all',
    ];

    /**
     * role name => permissions it receives.
     * admin gets everything (handled below).
     */
    public const ROLE_PERMISSIONS = [
        'chair' => ['dashboard.view', 'analytics.view', 'risk.view', 'reports.export', 'grades.view-all', 'import.view'],
        'faculty' => ['dashboard.view', 'analytics.view', 'risk.view', 'grades.view-all', 'import.view', 'import.upload'],
        'student' => ['dashboard.view', 'grades.view-own'],
    ];

    public function run(): void
    {
        // Create every permission (firstOrCreate keeps re-seeding safe).
        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Admin: single role holding every permission.
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        // Chair / faculty / student: explicit subsets.
        foreach (self::ROLE_PERMISSIONS as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($permissions);
        }
    }
}
