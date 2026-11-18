import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Forbidden() {
    return (
        <AppLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">403 Forbidden</h2>}
        >
            <Head title="403 Forbidden" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Denied</h3>
                        <p className="text-gray-600">
                            You do not have permission to access this resource.<br />
                            Please contact your administrator if you believe this is an error.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}