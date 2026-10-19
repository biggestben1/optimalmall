import { Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '../Components/ApplicationLogo';

export default function AppLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const { post } = useForm({});

    return (
        <div className="min-h-screen bg-surface-container-low">
            <nav className="border-b border-surface-container bg-surface-container-lowest">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-6">
                        <ApplicationLogo showTagline={false} size="sm" />
                        <Link href={route('dashboard')} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Dashboard</Link>
                        <Link href={route('profile.edit')} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Profile</Link>
                        {auth.user?.is_super_admin && (
                            <Link href={route('admin.dashboard')} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Admin</Link>
                        )}
                        {auth.user?.is_vendor && (
                            <Link href={route('vendor.dashboard')} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Seller</Link>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span>{auth.user?.name}</span>
                        <button
                            type="button"
                            className="font-bold text-primary"
                            onClick={() => post(route('logout'))}
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </nav>
            {header && (
                <header className="bg-surface-container-lowest shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{header}</div>
                </header>
            )}
            <main>
                {flash?.status && (
                    <div className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
                        <div className="rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{flash.status}</div>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
