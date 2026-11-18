import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

// Helper to capitalize role names: "chair" -> "Chair"
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Group array of permission objects or strings by their module (prefix before dot)
function groupPermissions(permissionsList) {
    return permissionsList.reduce((acc, perm) => {
        const name = typeof perm === 'string' ? perm : perm.name;
        const moduleName = name.includes('.') ? name.split('.')[0] : 'general';
        if (!acc[moduleName]) {
            acc[moduleName] = [];
        }
        acc[moduleName].push(perm);
        return acc;
    }, {});
}

export default function RolesIndex({ roles, allPermissions }) {
    const [viewModalRole, setViewModalRole] = useState(null);
    const [editModalRole, setEditModalRole] = useState(null);

    return (
        <AppLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Roles
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        The four roles are fixed. You can change which permissions each role has.
                    </p>
                </div>
            }
        >
            <Head title="Role Management" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* 2-Column responsive grid of role cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {roles.map((role) => (
                            <RoleCard
                                key={role.id}
                                role={role}
                                onOpenView={() => setViewModalRole(role)}
                                onOpenEdit={() => setEditModalRole(role)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Read-Only Modal for Admin */}
            {viewModalRole && (
                <ViewRoleModal
                    role={viewModalRole}
                    onClose={() => setViewModalRole(null)}
                />
            )}

            {/* Edit Modal for Editable Roles */}
            {editModalRole && (
                <EditRoleModal
                    role={editModalRole}
                    allPermissions={allPermissions}
                    onClose={() => setEditModalRole(null)}
                />
            )}
        </AppLayout>
    );
}

// Card component for an individual role
function RoleCard({ role, onOpenView, onOpenEdit }) {
    const grouped = groupPermissions(role.permissions);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
                {/* Header: Title, Lock badge, User/Perm counts, Action Button */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">
                                {capitalize(role.name)}
                            </h3>
                            {role.is_admin && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    🔒 Locked
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {role.users_count} {role.users_count === 1 ? 'user' : 'users'} · {role.permissions.length} {role.permissions.length === 1 ? 'permission' : 'permissions'}
                        </p>
                    </div>

                    <div>
                        {role.is_admin ? (
                            <SecondaryButton onClick={onOpenView} className="!text-xs !py-1.5 !px-3">
                                View
                            </SecondaryButton>
                        ) : (
                            <SecondaryButton onClick={onOpenEdit} className="!text-xs !py-1.5 !px-3">
                                Edit permissions
                            </SecondaryButton>
                        )}
                    </div>
                </div>

                {/* Chips section */}
                <div className="mt-6 space-y-4">
                    {Object.keys(grouped).length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No permissions assigned.</p>
                    ) : (
                        Object.entries(grouped).map(([moduleName, perms]) => (
                            <div key={moduleName}>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                                    {moduleName}
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {perms.map((permName) => (
                                        <span
                                            key={permName}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#14653A]"
                                        >
                                            {permName.includes('.') ? permName.split('.')[1] : permName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Read-only modal displaying permissions for Admin role
function ViewRoleModal({ role, onClose }) {
    const grouped = groupPermissions(role.permissions);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">
                                {capitalize(role.name)} Permissions
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                🔒 Locked
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            The admin role retains full system access and cannot be modified.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    {Object.entries(grouped).map(([moduleName, perms]) => (
                        <div key={moduleName}>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                {moduleName}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {perms.map((permName) => (
                                    <span
                                        key={permName}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#14653A]"
                                    >
                                        {permName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <SecondaryButton onClick={onClose}>Close</SecondaryButton>
                </div>
            </div>
        </div>
    );
}

// Edit modal for updating permissions of a role
function EditRoleModal({ role, allPermissions, onClose }) {
    // Initial permission IDs owned by this role
    const initialIds = role.permission_ids || [];

    const { data, setData, patch, processing, errors } = useForm({
        permissions: initialIds,
    });

    // Group allPermissions by module
    const groupedAll = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
    }, {});

    const togglePermission = (id) => {
        if (data.permissions.includes(id)) {
            setData('permissions', data.permissions.filter((pId) => pId !== id));
        } else {
            setData('permissions', [...data.permissions, id]);
        }
    };

    const toggleGroup = (modulePerms) => {
        const moduleIds = modulePerms.map((p) => p.id);
        const allSelected = moduleIds.every((id) => data.permissions.includes(id));

        if (allSelected) {
            // Deselect all in module
            setData(
                'permissions',
                data.permissions.filter((id) => !moduleIds.includes(id))
            );
        } else {
            // Select all in module
            const newSet = new Set([...data.permissions, ...moduleIds]);
            setData('permissions', Array.from(newSet));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('admin.roles.update', role.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Edit Permissions — {capitalize(role.name)}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Select the permissions to assign to the {role.name} role.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        {Object.entries(groupedAll).map(([moduleName, modulePerms]) => {
                            const moduleIds = modulePerms.map((p) => p.id);
                            const allSelected = moduleIds.every((id) => data.permissions.includes(id));
                            const someSelected = moduleIds.some((id) => data.permissions.includes(id));

                            return (
                                <div key={moduleName} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                            {moduleName}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroup(modulePerms)}
                                            className="text-xs text-primary font-medium hover:underline"
                                        >
                                            {allSelected ? 'Clear all' : 'Select all'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {modulePerms.map((perm) => (
                                            <label
                                                key={perm.id}
                                                className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 bg-white p-2.5 rounded border border-gray-200 hover:border-gray-300"
                                            >
                                                <Checkbox
                                                    checked={data.permissions.includes(perm.id)}
                                                    onChange={() => togglePermission(perm.id)}
                                                />
                                                <span className="font-medium text-xs">
                                                    {perm.name.includes('.') ? perm.name.split('.')[1] : perm.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={onClose}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
