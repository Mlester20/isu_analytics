import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

// Placeholder — risk analytics comes later.
export default function RiskIndex() {
    return (
        <AppLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Risk Analytics
                </h2>
            }
        >
            <Head title="Risk Analytics" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Risk analytics will live here.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
