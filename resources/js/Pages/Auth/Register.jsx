import AuthLayout, { Icon, IconField, PasswordField } from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

/*
 * NOTE: Self-registration may be disabled later — the admin will create
 * accounts from the Users admin panel. To disable it, comment out the
 * register routes in routes/auth.php and remove the "Register" link below.
 */
export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Join the ISU analytics workspace."
        >
            <Head title="Register" />

            <form onSubmit={submit} noValidate>
                <div>
                    <IconField
                        id="name"
                        label="Full name"
                        name="name"
                        icon={Icon.User}
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        error={errors.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                </div>

                <div className="mt-4">
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
                        required
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
                        error={errors.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
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
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary-dark to-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-primary-dark hover:to-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Creating account…' : 'Create account'}
                </button>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already registered?{' '}
                    <Link
                        href={route('login')}
                        className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
