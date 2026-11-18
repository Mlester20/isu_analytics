import { usePage } from '@inertiajs/react';

export function useCan(permission) {
    const { auth } = usePage().props;
    if (!auth || !auth.user) return false;
    if (auth.user.roles?.includes('admin')) return true;
    return auth.user.permissions?.includes(permission) ?? false;
}

export function useRole(role) {
    const { auth } = usePage().props;
    return auth?.user?.roles?.includes(role) ?? false;
}
