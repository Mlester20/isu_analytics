import { Head } from '@inertiajs/react';
import { useState } from 'react';

/*
 * Shared split-screen layout for all auth pages (Login, Register,
 * Forgot/Reset Password). The left brand panel is rendered once here;
 * pages only pass their form via `children`.
 *
 * Theme: ISU greens/gold, defined as Tailwind tokens in tailwind.config.js.
 */

// Inline SVG icons (lucide-react is not installed, so these are the same
// paths lucide uses). Each takes a className for sizing/coloring.
export const Icon = {
    Mail: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    ),
    Lock: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    User: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Eye: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    EyeOff: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
            <path d="m2 2 20 20" />
        </svg>
    ),
    Upload: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    ),
    Chart: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    ),
    Alert: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21.801 10A10 10 0 1 1 17 3.335" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    ),
};

// One feature row on the left panel: translucent icon tile + text.
function FeatureRow({ icon: IconComponent, children }) {
    return (
        <li className="flex items-start gap-3">
            <span
                aria-hidden="true"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15"
            >
                <IconComponent className="h-5 w-5 flex-shrink-0 text-accent" />
            </span>
            <p className="text-sm leading-relaxed text-emerald-50/90">{children}</p>
        </li>
    );
}

// Branded left panel — hidden on mobile, where a compact header is shown instead.
function BrandPanel() {
    return (
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
            {/* Soft decorative circles, same feel as the reference gradient */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-black/10" />

            <div className="relative z-10 flex items-center gap-3 p-10">
                {/* Logo in a rounded translucent container with a gold ring.
                    White (not green) behind the seal so it stays visible on
                    the gradient. */}
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 ring-1 ring-accent">
                    <img
                        src="/images/isu-logo.png"
                        alt="Isabela State University logo"
                        className="h-9 w-9 object-contain"
                    />
                </span>
                <span className="text-lg font-semibold tracking-wide text-white">
                    ISU Analytics
                </span>
            </div>

            <div className="relative z-10 max-w-lg px-10">
                <h2 className="text-3xl font-bold leading-snug text-white xl:text-4xl">
                    Every grade, trend and student at risk in one view.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-emerald-50/90">
                    Turn semester records into clear insights that help faculty
                    and administrators support student success.
                </p>

                <ul className="mt-10 space-y-5">
                    <FeatureRow icon={Icon.Upload}>
                        Import CSV records and store them securely in one place
                    </FeatureRow>
                    <FeatureRow icon={Icon.Chart}>
                        Track grades, attendance and pass rates with live charts
                    </FeatureRow>
                    <FeatureRow icon={Icon.Alert}>
                        Identify students who may need academic intervention early
                    </FeatureRow>
                </ul>
            </div>

            <p className="relative z-10 p-10 text-xs text-emerald-100/70">
                © 2026 Isabela State University. All rights reserved.
            </p>
        </div>
    );
}

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <>
            <Head title={title} />

            <div className="flex min-h-screen bg-white">
                <BrandPanel />

                {/* Right panel: the form column, centered */}
                <div className="flex w-full flex-col items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2">
                    {/* Mobile-only compact brand header */}
                    <div className="mb-8 flex flex-col items-center text-center lg:hidden">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-dark/5 ring-1 ring-primary/20">
                            <img
                                src="/images/isu-logo.png"
                                alt="Isabela State University logo"
                                className="h-10 w-10 object-contain"
                            />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-primary-dark">
                            ISU Analytics
                        </p>
                        <p className="text-xs text-gray-500">
                            Student Academic Performance Analytics Dashboard
                        </p>
                    </div>

                    <div className="w-full max-w-[420px]">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>

                        {/* Thin gold divider under the heading */}
                        <div className="mt-4 h-0.5 w-10 rounded-full bg-accent" />

                        <div className="mt-6">{children}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Exported for the auth pages: labeled input with a leading icon, and the
// show/hide password toggle. Keeping them here avoids duplicating markup
// across Login/Register/Reset.
export function IconField({ id, label, type = 'text', icon: IconComponent, error, trailing = null, ...props }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="relative mt-1.5">
                {IconComponent && (
                    <IconComponent
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 flex-shrink-0 -translate-y-1/2 text-gray-400"
                    />
                )}
                <input
                    id={id}
                    type={type}
                    aria-invalid={error ? 'true' : 'false'}
                    className={
                        'block w-full rounded-lg border py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none focus:ring-2 ' +
                        (IconComponent ? 'pl-11 ' : 'pl-3.5 ') +
                        (trailing ? 'pr-11 ' : 'pr-3.5 ') +
                        (error
                            ? 'border-red-300 focus:border-flame focus:ring-flame/25'
                            : 'border-gray-300 focus:border-primary focus:ring-primary/25')
                    }
                    {...props}
                />
                {trailing}
            </div>
            {error && <p className="mt-1.5 text-sm text-flame" role="alert">{error}</p>}
        </div>
    );
}

// Password input with an eye show/hide toggle on the right.
export function PasswordField(props) {
    const [visible, setVisible] = useState(false);

    return (
        <IconField
            {...props}
            type={visible ? 'text' : 'password'}
            trailing={
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-gray-400 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {visible ? <Icon.EyeOff className="h-5 w-5 flex-shrink-0" /> : <Icon.Eye className="h-5 w-5 flex-shrink-0" />}
                </button>
            }
        />
    );
}
