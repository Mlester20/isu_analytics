import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import { Calendar } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const userRole = user.roles?.[0] || 'student';

    const roleColors = {
        admin: 'bg-purple-100 text-purple-700',
        chair: 'bg-blue-100 text-blue-700',
        faculty: 'bg-green-100 text-green-700',
        student: 'bg-yellow-100 text-yellow-700',
    };

    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header Banner & User Summary Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
                    {/* Green gradient banner */}
                    <div className="h-32 bg-gradient-to-r from-primary-dark via-primary to-primary-dark" />

                    <div className="relative px-6 pb-6 pt-0 sm:px-8">
                        {/* Avatar overlapping banner */}
                        <div className="-mt-16 mb-4 flex items-end justify-between">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white ring-4 ring-white shadow-md text-2xl font-bold text-primary">
                                {initials(user.name)}
                            </div>
                        </div>

                        {/* User info details */}
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-sm text-gray-500">{user.email}</p>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleColors[userRole] || 'bg-gray-100 text-gray-700'}`}>
                                    {userRole}
                                </span>
                                {user.created_at && (
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        Member since {user.created_at}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side-by-side forms card container */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left: Personal Information */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    {/* Right: Security */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:p-8">
                        <UpdatePasswordForm />
                    </div>
                </div>

                {/* Account Deletion */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}

function initials(name) {
    if (!name) return 'U';
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
