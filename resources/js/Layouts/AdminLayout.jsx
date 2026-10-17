import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '../Components/ApplicationLogo';

const navLinks = [
    { route: 'admin.dashboard', label: 'Dashboard', icon: 'dashboard', match: 'admin.dashboard' },
    { route: 'admin.products.index', label: 'Products', icon: 'inventory_2', match: 'admin.products.*' },
    { route: 'admin.categories.index', label: 'Categories', icon: 'category', match: 'admin.categories.*' },
    { route: 'admin.vendors.index', label: 'Vendors', icon: 'storefront', match: 'admin.vendors.*' },
    { route: 'admin.customers.index', label: 'Customers', icon: 'group', match: 'admin.customers.*' },
    { route: 'admin.banners.index', label: 'Banners', icon: 'image', match: 'admin.banners.*' },
];

const comingSoon = [
    'Orders',
    'Payments & Settlements',
    'Coupons',
    'Advertising',
    'Reviews',
    'Returns',
    'Reports',
    'Roles & Security',
];

function isActive(match) {
    return route().current(match);
}

export default function AdminLayout({ title, heading, children }) {
    const { auth, flash } = usePage().props;
    const { post } = useForm({});
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface-container-low font-sans text-on-surface antialiased lg:grid lg:grid-cols-[260px_1fr]">
            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[260px] transform bg-primary text-on-primary transition lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="border-b border-white/10 px-5 py-5">
                    <ApplicationLogo href={route('admin.dashboard')} showTagline={false} size="sm" inverted />
                    <div className="mt-1 pl-10 text-xs text-primary-fixed">Admin Console</div>
                </div>

                <nav className="space-y-1 p-3 text-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.route}
                            href={route(link.route)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                isActive(link.match) ? 'bg-white/15 font-bold' : 'hover:bg-white/10'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}

                    <div className="px-3 pt-4 text-[10px] font-bold uppercase tracking-wide text-primary-fixed">
                        Coming soon
                    </div>
                    {comingSoon.map((label) => (
                        <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary-fixed/70">
                            <span className="material-symbols-outlined text-[18px]">lock</span>
                            {label}
                        </div>
                    ))}

                    <Link
                        href={route('home')}
                        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10"
                    >
                        <span className="material-symbols-outlined text-[18px]">store</span>
                        View storefront
                    </Link>
                </nav>
            </aside>

            <div className="min-w-0">
                <header className="flex items-center justify-between border-b border-surface-container bg-surface-container-lowest px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-lg p-1 hover:bg-surface-container-low lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            {title && <div className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{title}</div>}
                            <h1 className="font-display text-xl font-bold">{heading}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden sm:inline">{auth.user?.name}</span>
                        <button
                            type="button"
                            className="font-bold text-primary"
                            onClick={() => post(route('logout'))}
                        >
                            Log out
                        </button>
                    </div>
                </header>

                <main className="p-4 sm:p-6">
                    {flash?.status && (
                        <div className="mb-4 rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">
                            {flash.status}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
