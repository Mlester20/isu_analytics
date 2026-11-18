import AuthLayout, { Icon, IconField, PasswordField } from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Choose a new password for your account."
        >
            <Head title="Reset Password" />

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
                        autoComplete="new-password"
                        autoFocus
                        error={errors.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <PasswordField
                        id="password_confirmation"
                        label="Confirm password"
                        name="password_confirmation"
                        icon={Icon.Lock}
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        error={errors.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary-dark to-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-primary-dark hover:to-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Resetting…' : 'Reset password'}
                </button>
            </form>
        </AuthLayout>
    );
}
