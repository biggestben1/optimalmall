import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '../Components/ApplicationLogo';

const navLinks = [
    { route: 'vendor.dashboard', label: 'Dashboard', icon: 'dashboard', match: 'vendor.dashboard' },
    { route: 'vendor.products.index', label: 'Products', icon: 'inventory_2', matches: ['vendor.products.index', 'vendor.products.edit'] },
    { route: 'vendor.products.create', label: 'Add product', icon: 'add_box', match: 'vendor.products.create' },
    { route: 'vendor.reports', label: 'Sales report', icon: 'monitoring', match: 'vendor.reports' },
];

const sidebarStorageKey = 'vendor-sidebar';

function isActive(link) {
    const patterns = link.matches ?? [link.match];

    return patterns.some((pattern) => route().current(pattern));
}

function isDesktop() {
    return window.matchMedia('(min-width: 1024px)').matches;
}

function initialSidebarOpen() {
    if (typeof window === 'undefined' || !isDesktop()) {
        return false;
    }

    return window.localStorage.getItem(sidebarStorageKey) !== 'closed';
}

export default function VendorLayout({ title, heading, children }) {
    const { auth, flash } = usePage().props;
    const { post } = useForm({});
    const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);

    function setSidebar(open, { persist = isDesktop() } = {}) {
        setSidebarOpen(open);

        if (persist) {
            window.localStorage.setItem(sidebarStorageKey, open ? 'open' : 'closed');
        }
    }

    return (
        <div
            className={`min-h-screen bg-surface-container-low font-sans text-on-surface antialiased ${
                sidebarOpen ? 'lg:grid lg:grid-cols-[260px_1fr]' : ''
            }`}
        >
            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    aria-label="Close menu"
                    onClick={() => setSidebar(false, { persist: false })}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[260px] transform flex-col bg-primary text-on-primary transition-transform duration-200 ${
                    sidebarOpen ? 'translate-x-0 lg:static' : '-translate-x-full lg:hidden'
                }`}
            >
                <div className="border-b border-white/10 px-5 py-5">
                    <ApplicationLogo href={route('vendor.dashboard')} showTagline={false} size="sm" inverted />
                    <div className="mt-3 rounded-xl bg-white/10 px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-secondary-container">Seller console</div>
                        <div className="mt-0.5 truncate text-sm font-bold">{auth.user?.shop_name || 'Your shop'}</div>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3 text-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.route}
                            href={route(link.route)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 ${
                                isActive(link) ? 'bg-secondary-container font-bold text-on-secondary' : 'hover:bg-white/10'
                            }`}
                            onClick={() => {
                                if (!isDesktop()) {
                                    setSidebar(false, { persist: false });
                                }
                            }}
                        >
                            <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-3">
                    <Link href={route('home')} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10">
                        <span className="material-symbols-outlined text-[18px]">store</span>
                        View storefront
                    </Link>
                </div>
            </aside>

            <div className="min-w-0">
                <header className="flex items-center justify-between border-b border-surface-container bg-surface-container-lowest px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-lg p-1 hover:bg-surface-container-low"
                            onClick={() => setSidebar(!sidebarOpen)}
                            aria-expanded={sidebarOpen}
                            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                        >
                            <span className="material-symbols-outlined">{sidebarOpen ? 'menu_open' : 'menu'}</span>
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
