import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';

// Edit-user form: name/email, optional password reset, role, active flag.
export default function UsersEdit({ user, roles }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.roles[0] ?? 'student',
        is_active: user.is_active,
        position: user.position ?? '',
        department: user.department ?? '',
        school_id: user.school_id ?? '',
        program: user.program ?? '',
        year_level: user.year_level ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.users.update', user.id));
    };

    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit User — {user.name}
                </h2>
            }
        >
            <Head title={`Edit ${user.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Leave blank to keep the current password. */}
                            <div className="mt-4">
                                <InputLabel htmlFor="password" value="New Password (leave blank to keep)" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="password_confirmation" value="Confirm New Password" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="role" value="Role" />
                                <select
                                    id="role"
                                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    required
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            {['faculty', 'chair'].includes(data.role) && (
                                <>
                                    <div className="mt-4">
                                        <InputLabel htmlFor="position" value="Position" />
                                        <TextInput
                                            id="position"
                                            className="mt-1 block w-full"
                                            value={data.position}
                                            onChange={(e) => setData('position', e.target.value)}
                                        />
                                        <InputError message={errors.position} className="mt-2" />
                                    </div>
                                    <div className="mt-4">
                                        <InputLabel htmlFor="department" value="Department" />
                                        <TextInput
                                            id="department"
                                            className="mt-1 block w-full"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                        />
                                        <InputError message={errors.department} className="mt-2" />
                                    </div>
                                </>
                            )}

                            {data.role === 'student' && (
                                <>
                                    <div className="mt-4">
                                        <InputLabel htmlFor="school_id" value="School ID" />
                                        <TextInput
                                            id="school_id"
                                            className="mt-1 block w-full"
                                            value={data.school_id}
                                            onChange={(e) => setData('school_id', e.target.value)}
                                        />
                                        <InputError message={errors.school_id} className="mt-2" />
                                    </div>
                                    <div className="mt-4">
                                        <InputLabel htmlFor="program" value="Program" />
                                        <TextInput
                                            id="program"
                                            className="mt-1 block w-full"
                                            value={data.program}
                                            onChange={(e) => setData('program', e.target.value)}
                                        />
                                        <InputError message={errors.program} className="mt-2" />
                                    </div>
                                    <div className="mt-4">
                                        <InputLabel htmlFor="year_level" value="Year Level" />
                                        <select
                                            id="year_level"
                                            className="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.year_level}
                                            onChange={(e) => setData('year_level', e.target.value)}
                                        >
                                            <option value="">Select Year Level</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                        <InputError message={errors.year_level} className="mt-2" />
                                    </div>
                                </>
                            )}

                            <label className="mt-4 flex items-center">
                                <Checkbox
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <span className="ms-2 text-sm text-gray-600">Active (can log in)</span>
                            </label>

                            <div className="mt-6 flex items-center justify-end gap-2">
                                <Link href={route('admin.users.index')}>
                                    <SecondaryButton type="button">Cancel</SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing}>Save Changes</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
