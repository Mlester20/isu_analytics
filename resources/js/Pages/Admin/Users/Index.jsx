import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Search, Edit3, Power, Trash2, X } from 'lucide-react';

export default function Index({ users = { data: [] }, filters = {}, roles = [] }) {
    const { props } = usePage();
    const currentUser = props.auth.user;
    const [search, setSearch] = useState(filters.search ?? '');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const createModalRef = useRef(null);
    const editModalRef = useRef(null);

    const [createData, setCreateData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        is_active: true,
        position: '',
        department: '',
        school_id: '',
        program: '',
        year_level: '',
    });

    const updateCreateData = (key, value) => {
        setCreateData(prev => ({ ...prev, [key]: value }));
    };

    const [editData, setEditData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        is_active: true,
        position: '',
        department: '',
        school_id: '',
        program: '',
        year_level: '',
    });

    const updateEditData = (key, value) => {
        setEditData(prev => ({ ...prev, [key]: value }));
    };
    const [createErrors, setCreateErrors] = useState({});
    const [createProcessing, setCreateProcessing] = useState(false);
    const [editErrors, setEditErrors] = useState({});
    const [editProcessing, setEditProcessing] = useState(false);

    const roleColors = {
        admin: 'bg-purple-100 text-purple-700',
        chair: 'bg-blue-100 text-blue-700',
        faculty: 'bg-green-100 text-green-700',
        student: 'bg-yellow-100 text-yellow-700',
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        setCreateProcessing(true);
        router.post(route('admin.users.store'), createData, {
            onSuccess: () => {
                setShowCreateModal(false);
                setCreateData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student',
                    is_active: true,
                    position: '',
                    department: '',
                    school_id: '',
                    program: '',
                    year_level: '',
                });
                setCreateErrors({});
                router.reload();
            },
            onError: (errors) => {
                setCreateErrors(errors);
                setCreateProcessing(false);
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setEditProcessing(true);
        router.patch(route('admin.users.update', editingUser.id), editData, {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingUser(null);
                setEditData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student',
                    is_active: true,
                    position: '',
                    department: '',
                    school_id: '',
                    program: '',
                    year_level: '',
                });
                setEditErrors({});
                router.reload();
            },
            onError: (errors) => {
                setEditErrors(errors);
                setEditProcessing(false);
            },
        });
    };

    const handleDelete = (user) => {
        if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
            router.delete(route('admin.users.destroy', user.id), {
                onSuccess: () => router.reload(),
            });
        }
    };

    const handleToggleActive = (user) => {
        router.patch(route('admin.users.update', user.id), {
            name: user.name,
            email: user.email,
            role: user.roles[0] ?? 'student',
            is_active: !user.is_active,
        }, {
            onSuccess: () => router.reload(),
        });
    };

    useEffect(() => {
        if (editingUser) {
            setEditData({
                name: editingUser.name,
                email: editingUser.email,
                password: '',
                role: editingUser.roles[0] ?? 'student',
                is_active: editingUser.is_active,
                position: editingUser.position ?? '',
                department: editingUser.department ?? '',
                school_id: editingUser.school_id ?? '',
                program: editingUser.program ?? '',
                year_level: editingUser.year_level ?? '',
            });
        }
    }, [editingUser]);

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingUser(null);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeCreateModal();
                closeEditModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Users</h2>
            }
        >
            <Head title="Users" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {props.flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{props.flash.success}</div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
                                >
                                    <span>+</span> NEW USER
                                </button>
                            </div>
                            <form onSubmit={handleSearch} className="mb-6 flex gap-3 relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <TextInput
                                    id="search"
                                    type="text"
                                    className="mt-1 block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition text-sm font-medium"
                                    >
                                        Search
                                    </button>
                                </div>
                            </form>

                            {showCreateModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" ref={createModalRef} onClick={closeCreateModal}>
                                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">New user</h3>
                                            <button onClick={closeCreateModal} className="text-gray-400 hover:text-gray-500">
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-sm text-gray-500 mb-6">Add a user to the system.</p>
                                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <InputLabel htmlFor="name" value="Name" />
                                                        <TextInput
                                                            id="name"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={createData.name}
                                                            onChange={(e) => updateCreateData('name', e.target.value)}
                                                            required
                                                        />
                                                        <InputError message={createErrors.name} className="mt-2" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="email" value="Email" />
                                                        <TextInput
                                                            id="email"
                                                            type="email"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={createData.email}
                                                            onChange={(e) => updateCreateData('email', e.target.value)}
                                                            required
                                                        />
                                                        <InputError message={createErrors.email} className="mt-2" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="password" value="Password" />
                                                        <TextInput
                                                            id="password"
                                                            type="password"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={createData.password}
                                                            onChange={(e) => updateCreateData('password', e.target.value)}
                                                            required
                                                        />
                                                        <InputError message={createErrors.password} className="mt-2" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="role" value="Role" />
                                                        <select
                                                            id="role"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={createData.role}
                                                            onChange={(e) => updateCreateData('role', e.target.value)}
                                                            required
                                                        >
                                                            {(roles ?? []).map((role) => (
                                                                <option key={role} value={role}>
                                                                    {capitalize(role)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <InputError message={createErrors.role} className="mt-2" />
                                                    </div>
                                                    {['faculty', 'chair'].includes(createData.role) && (
                                                        <>
                                                            <div>
                                                                <InputLabel htmlFor="position" value="Position" />
                                                                <TextInput
                                                                    id="position"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={createData.position}
                                                                    onChange={(e) => updateCreateData('position', e.target.value)}
                                                                />
                                                                <InputError message={createErrors.position} className="mt-2" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="department" value="Department" />
                                                                <TextInput
                                                                    id="department"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={createData.department}
                                                                    onChange={(e) => updateCreateData('department', e.target.value)}
                                                                />
                                                                <InputError message={createErrors.department} className="mt-2" />
                                                            </div>
                                                        </>
                                                    )}
                                                    {createData.role === 'student' && (
                                                        <>
                                                            <div>
                                                                <InputLabel htmlFor="school_id" value="School ID" />
                                                                <TextInput
                                                                    id="school_id"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={createData.school_id}
                                                                    onChange={(e) => updateCreateData('school_id', e.target.value)}
                                                                />
                                                                <InputError message={createErrors.school_id} className="mt-2" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="program" value="Program" />
                                                                <TextInput
                                                                    id="program"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={createData.program}
                                                                    onChange={(e) => updateCreateData('program', e.target.value)}
                                                                />
                                                                <InputError message={createErrors.program} className="mt-2" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="year_level" value="Year Level" />
                                                                <select
                                                                    id="year_level"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={createData.year_level}
                                                                    onChange={(e) => updateCreateData('year_level', e.target.value)}
                                                                >
                                                                    <option value="">Select Year Level</option>
                                                                    <option value="1">1st Year</option>
                                                                    <option value="2">2nd Year</option>
                                                                    <option value="3">3rd Year</option>
                                                                    <option value="4">4th Year</option>
                                                                </select>
                                                                <InputError message={createErrors.year_level} className="mt-2" />
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex items-center">
                                                        <Checkbox
                                                            name="is_active"
                                                            checked={createData.is_active}
                                                            onChange={(e) => updateCreateData('is_active', e.target.checked)}
                                                        />
                                                        <span className="ms-2 text-sm text-gray-600">Active (can log in)</span>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex items-center justify-end gap-2">
                                                    <SecondaryButton type="button" onClick={closeCreateModal}>Cancel</SecondaryButton>
                                                    <PrimaryButton disabled={createProcessing}>Create user</PrimaryButton>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showEditModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" ref={editModalRef} onClick={closeEditModal}>
                                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">Edit user</h3>
                                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-500">
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-sm text-gray-500 mb-6">Update user information.</p>
                                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <InputLabel htmlFor="name" value="Name" />
                                                        <TextInput
                                                            id="name"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={editData.name}
                                                            onChange={(e) => updateEditData('name', e.target.value)}
                                                            required
                                                        />
                                                        <InputError message={editErrors.name} className="mt-2" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="email" value="Email" />
                                                        <TextInput
                                                            id="email"
                                                            type="email"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={editData.email}
                                                            onChange={(e) => updateEditData('email', e.target.value)}
                                                            required
                                                        />
                                                        <InputError message={editErrors.email} className="mt-2" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="password" value="New Password (leave blank to keep current)" />
                                                        <TextInput
                                                            id="password"
                                                            type="password"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={editData.password}
                                                            onChange={(e) => updateEditData('password', e.target.value)}
                                                        />
                                                        <InputError message={editErrors.password} className="mt-2" />
                                                    </div>
                                                    <div>
                                                        <InputLabel htmlFor="role" value="Role" />
                                                        <select
                                                            id="role"
                                                            className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                            value={editData.role}
                                                            onChange={(e) => updateEditData('role', e.target.value)}
                                                            required
                                                        >
                                                            {(roles ?? []).map((role) => (
                                                                <option key={role} value={role}>
                                                                    {capitalize(role)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <InputError message={editErrors.role} className="mt-2" />
                                                    </div>
                                                    {['faculty', 'chair'].includes(editData.role) && (
                                                        <>
                                                            <div>
                                                                <InputLabel htmlFor="position" value="Position" />
                                                                <TextInput
                                                                    id="position"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={editData.position}
                                                                    onChange={(e) => updateEditData('position', e.target.value)}
                                                                />
                                                                <InputError message={editErrors.position} className="mt-2" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="department" value="Department" />
                                                                <TextInput
                                                                    id="department"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={editData.department}
                                                                    onChange={(e) => updateEditData('department', e.target.value)}
                                                                />
                                                                <InputError message={editErrors.department} className="mt-2" />
                                                            </div>
                                                        </>
                                                    )}
                                                    {editData.role === 'student' && (
                                                        <>
                                                            <div>
                                                                <InputLabel htmlFor="school_id" value="School ID" />
                                                                <TextInput
                                                                    id="school_id"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={editData.school_id}
                                                                    onChange={(e) => updateEditData('school_id', e.target.value)}
                                                                />
                                                                <InputError message={editErrors.school_id} className="mt-2" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="program" value="Program" />
                                                                <TextInput
                                                                    id="program"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={editData.program}
                                                                    onChange={(e) => updateEditData('program', e.target.value)}
                                                                />
                                                                <InputError message={editErrors.program} className="mt-2" />
                                                            </div>
                                                            <div>
                                                                <InputLabel htmlFor="year_level" value="Year Level" />
                                                                <select
                                                                    id="year_level"
                                                                    className="mt-1 block w-full border rounded-lg px-3 py-2 focus:ring-green-500"
                                                                    value={editData.year_level}
                                                                    onChange={(e) => updateEditData('year_level', e.target.value)}
                                                                >
                                                                    <option value="">Select Year Level</option>
                                                                    <option value="1">1st Year</option>
                                                                    <option value="2">2nd Year</option>
                                                                    <option value="3">3rd Year</option>
                                                                    <option value="4">4th Year</option>
                                                                </select>
                                                                <InputError message={editErrors.year_level} className="mt-2" />
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex items-center">
                                                        <Checkbox
                                                            name="is_active"
                                                            checked={editData.is_active}
                                                            onChange={(e) => updateEditData('is_active', e.target.checked)}
                                                        />
                                                        <span className="ms-2 text-sm text-gray-600">Active (can log in)</span>
                                                    </div>
                                                </div>
                                                <div className="mt-6 flex items-center justify-end gap-2">
                                                    <SecondaryButton type="button" onClick={closeEditModal}>Cancel</SecondaryButton>
                                                    <PrimaryButton disabled={editProcessing}>Save changes</PrimaryButton>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">USER</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ROLE</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(users?.data ?? []).map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{user.name} {user.id === currentUser.id && '(you)'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.roles[0]] || 'bg-gray-100 text-gray-500'}`}>
                                                    {capitalize(user.roles[0] || 'No role')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => {setEditingUser(user); setShowEditModal(true);}} className="text-green-700 hover:text-green-900" title="Edit">
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    {user.id !== currentUser.id && (
                                                        <>
                                                            <button type="button" onClick={() => handleToggleActive(user)} className="text-amber-700 hover:text-amber-900" title={user.is_active ? 'Deactivate' : 'Activate'}>
                                                                <Power className="h-4 w-4" />
                                                            </button>
                                                            <button type="button" onClick={() => handleDelete(user)} className="text-red-700 hover:text-red-900" title="Delete">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
