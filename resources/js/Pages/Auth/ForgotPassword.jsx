import AuthLayout, { Icon, IconField } from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="Forgot password"
            subtitle="We'll email you a reset link."
        >
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm leading-relaxed text-gray-600">
                Just let us know your email address and we will email you a
                password reset link that will allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 rounded-md bg-primary-light/10 p-3 text-sm font-medium text-primary-dark">
                    {status}
                </div>
            )}

            <form onSubmit={submit} noValidate>
                <IconField
                    id="email"
                    label="Email"
                    type="email"
                    name="email"
                    icon={Icon.Mail}
                    value={data.email}
                    autoFocus
                    error={errors.email}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary-dark to-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-primary-dark hover:to-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Sending…' : 'Email password reset link'}
                </button>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Remembered it?{' '}
                    <a
                        href={route('login')}
                        className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                    >
                        Sign in
                    </a>
                </p>
            </form>
        </AuthLayout>
    );
}
