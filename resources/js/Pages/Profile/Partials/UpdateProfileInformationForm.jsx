import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const userRoles = user.roles || [];
    const isFacultyOrChair = userRoles.includes('faculty') || userRoles.includes('chair');

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name || '',
            email: user.email || '',
            position: user.position || '',
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h3 className="text-lg font-bold text-gray-900">
                    Personal Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Update your name, email, and profile details.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="FULL NAME" className="text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full focus:ring-primary focus:border-primary"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="EMAIL ADDRESS" className="text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full focus:ring-primary focus:border-primary"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {isFacultyOrChair && (
                    <div>
                        <InputLabel htmlFor="position" value="POSITION" className="text-xs font-semibold text-gray-500 uppercase tracking-wider" />
                        <TextInput
                            id="position"
                            type="text"
                            className="mt-1 block w-full focus:ring-primary focus:border-primary"
                            placeholder="e.g. Instructor I, Professor II"
                            value={data.position}
                            onChange={(e) => setData('position', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.position} />
                    </div>
                )}

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="bg-primary hover:bg-primary-dark">
                        Save personal information
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
