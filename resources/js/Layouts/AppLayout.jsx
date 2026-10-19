import { Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '../Components/ApplicationLogo';

export default function AppLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const { post } = useForm({});

    return (
        <div className="min-h-screen bg-surface-container-low">
            <nav className="border-b border-surface-container bg-surface-container-lowest">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 lg:px-8">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2">
                        <ApplicationLogo showTagline={false} size="sm" />
                        <NavLink href={route('dashboard')} active={route().current('dashboard')}>Dashboard</NavLink>
                        <NavLink href={route('profile.edit')} active={route().current('profile.edit')}>Profile</NavLink>
                        {auth.user?.role === 'customer' && (
                            <>
                                <NavLink href={route('account.orders.index')} active={route().current('account.orders.*')}>Orders</NavLink>
                                <NavLink href={route('wallet.index')} active={route().current('wallet.*')}>Wallet</NavLink>
                            </>
                        )}
                        {auth.user?.is_super_admin && (
                            <Link href={route('admin.dashboard')} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Admin</Link>
                        )}
                        {auth.user?.is_vendor && (
                            <Link href={route('vendor.dashboard')} className="text-sm font-semibold text-on-surface-variant hover:text-primary">Seller</Link>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="max-w-40 truncate font-semibold">{auth.user?.name}</span>
                        <button
                            type="button"
                            className="whitespace-nowrap font-bold text-primary"
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
                {(flash?.status || flash?.error) && (
                    <div className="mx-auto max-w-7xl space-y-2 px-4 pt-4 lg:px-8">
                        {flash?.status && <div className="rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{flash.status}</div>}
                        {flash?.error && <div className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">{flash.error}</div>}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link href={href} className={`text-sm font-semibold ${active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
            {children}
        </Link>
    );
}
