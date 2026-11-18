import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { useCan } from '@/Hooks/useCan';
import { Search, LogOut, ChevronDown } from 'lucide-react';

/*
 * The authenticated app shell: dark-green ISU-branded sidebar on desktop,
 * off-canvas drawer on mobile, and a slim top bar with the page header.
 *
 * Nav links are conditioned on permissions shared from the backend
 * (auth.permissions), so users only see what they can actually open.
 */

// Inline SVG icon set (lucide paths, no icon library installed).
const Icon = {
    Chart: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    ),
    Upload: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    ),
    Alert: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21.801 10A10 10 0 1 1 17 3.335" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    ),
    Users: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 1-4 4v2" />
            <circle cx="16" cy="7" r="4" />
        </svg>
    ),
    Shield: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
    ),
    Menu: (props) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
};

// Sidebar nav definition. `can` names a permission; links without one are
// always shown. Groups with no visible links are hidden entirely.
const navigation = [
    {
        links: [
            { name: 'Dashboard', href: 'dashboard', icon: Icon.Chart, can: 'dashboard.view' },
        ],
    },
    {
        group: 'ANALYTICS',
        links: [
            { name: 'Statistics', href: 'dashboard', icon: Icon.Chart, can: 'analytics.view' },
            { name: 'Charts & Insights', href: 'dashboard', icon: Icon.Chart, can: 'analytics.view' },
            { name: 'Rankings', href: 'dashboard', icon: Icon.Chart, can: 'analytics.view' },
            { name: 'At-Risk Students', href: 'risk.index', icon: Icon.Alert, can: 'risk.view' },
        ],
    },
    {
        group: 'DATA',
        links: [
            { name: 'Grades', href: 'dashboard', icon: Icon.Users, can: 'grades.view-all' },
            { name: 'Import CSV', href: 'import.index', icon: Icon.Upload, can: 'import.view' },
        ],
    },
    {
        group: 'ADMINISTRATION',
        links: [
            { name: 'Users', href: 'admin.users.index', icon: Icon.Users, can: 'users.manage' },
            { name: 'Roles', href: 'admin.roles.index', icon: Icon.Shield, can: 'roles.manage' },
        ],
    },
    {
        group: 'STUDENT',
        links: [
            { name: 'My Grades', href: 'grades.own', icon: Icon.Alert, can: 'grades.view-own' },
        ],
    },
];

export default function AppLayout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const { auth, flash } = usePage().props;

    // Close user menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Use our hooks unconditionally at the top level
    const canDashboard = useCan('dashboard.view');
    const canAnalytics = useCan('analytics.view');
    const canViewRisk = useCan('risk.view');
    const canViewAllGrades = useCan('grades.view-all');
    const canImportCsv = useCan('import.view');
    const canManageUsers = useCan('users.manage');
    const canManageRoles = useCan('roles.manage');
    const canViewOwnGrades = useCan('grades.view-own');

    // Create the navigation structure with conditional logic based on permissions
    const visibleGroups = navigation
        .map((group) => ({
            ...group,
            links: group.links.filter((link) => {
                // Permission check
                if (link.can && !(auth?.user?.permissions?.includes(link.can) || auth?.user?.roles?.includes('admin'))) {
                    return false;
                }
                return true;
            }),
        }))
        .filter((group) => group.links.length > 0);

    // Determine active route using Inertia's route() helper
    const currentUrl = usePage().url;

    // Active route detection logic: link active only when current URL matches
    // Use exact equality for strict match, startsWith for parent routes with children

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Backdrop for the mobile drawer */}
            {sidebarOpen && (
                <div
                    aria-hidden="true"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
                />
            )}

            {/* Sidebar: off-canvas drawer on mobile, fixed column on desktop */}
            <aside
                className={
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-primary-dark via-primary to-primary-dark text-white transition-transform duration-200 ease-in-out lg:translate-x-0 ' +
                    (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
                }
            >
                {/* Brand */}
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 ring-1 ring-accent">
                        <img
                            src="/images/isu-logo.png"
                            alt="Isabela State University logo"
                            className="h-8 w-8 object-contain"
                        />
                    </span>
                    <span className="text-base font-semibold tracking-wide">
                        ISU Analytics
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-6 overflow-y-auto no-scrollbar px-3 py-4">
                    {visibleGroups.map((group, groupIdx) => (
                        <div key={group.group || groupIdx}>
                            {group.group && (
                                <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                                    {group.group}
                                </p>
                            )}
                            <ul className="space-y-1">
                                {group.links.map((link) => {
                                    const linkUrl = route(link.href);
                                    const isActive = currentUrl === linkUrl || currentUrl?.startsWith(linkUrl + '/');
                                    return (
                                        <li key={link.name}>
                                            <SidebarLink
                                                href={route(link.href)}
                                                active={isActive}
                                            >
                                                <link.icon className="h-[18px] w-[18px] shrink-0" />
                                                <span className="truncate">{link.name}</span>
                                            </SidebarLink>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Visual stop at sidebar bottom (empty space) */}
                <div className="shrink-0 border-t border-white/10" />
            </aside>

            {/* Main column */}
            <div className="flex min-h-screen flex-col lg:pl-64">
                {/* Top bar: hamburger (mobile) + page header + user menu */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 lg:hidden"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Icon.Menu className="h-6 w-6" />
                    </button>

                    <div className="min-w-0 flex-1">{header}</div>

                    {/* Desktop user dropdown */}
                    <div className="hidden items-center gap-2 sm:flex relative" ref={userMenuRef}>
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                                {initials(auth.user.name)}
                            </span>
                            <span>{auth.user.name}</span>
                            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {userMenuOpen && (
                            <div className="absolute top-full right-0 mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-100 z-50">
                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setUserMenuOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        router.post(route('logout'));
                                        setUserMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Flash message */}
                {flash?.success && (
                    <div className="border-b border-green-100 bg-green-50 px-4 py-2.5 text-sm text-green-800 sm:px-6 lg:px-8">
                        {flash.success}
                    </div>
                )}

                {/* Page content */}
                <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

// One sidebar link; a gold bar marks the active route.
function SidebarLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ' +
                (active
                    ? 'bg-white/15 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white')
            }
        >
            {children}
            {active && (
                <span
                    aria-hidden="true"
                    className="absolute inset-y-1 left-0 w-1 rounded-full bg-accent"
                />
            )}
        </Link>
    );
}

// "Juan Dela Cruz" -> "JD"
function initials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
