import Checkbox from '@/Components/Checkbox';
import AuthLayout, { Icon, IconField, PasswordField } from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your analytics workspace."
        >
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-md bg-primary-light/10 p-3 text-sm font-medium text-primary-dark">
                    {status}
                </div>
            )}

            <form onSubmit={submit} noValidate>
                <div>
                    <IconField
                        id="email"
                        label="Email"
                        type="email"
                        name="email"
                        icon={Icon.Mail}
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        error={errors.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <PasswordField
                        id="password"
                        label="Password"
                        name="password"
                        icon={Icon.Lock}
                        value={data.password}
                        autoComplete="current-password"
                        error={errors.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary-dark to-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-primary-dark hover:to-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Signing in…' : 'Sign in'}
                </button>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
