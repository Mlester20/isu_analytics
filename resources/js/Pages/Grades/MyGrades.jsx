import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

// Placeholder — a student's own grades come later.
export default function MyGrades() {
    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Grades
                </h2>
            }
        >
            <Head title="My Grades" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Your grades will appear here.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
