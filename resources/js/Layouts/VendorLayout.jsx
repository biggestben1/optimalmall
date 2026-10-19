import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '../Components/ApplicationLogo';

const navGroups = [
    {
        label: 'Shop',
        links: [
            { route: 'vendor.dashboard', label: 'Dashboard', icon: 'dashboard', match: 'vendor.dashboard' },
            { route: 'vendor.store.edit', label: 'Store profile', icon: 'storefront', match: 'vendor.store.*' },
            { route: 'vendor.products.index', label: 'Products', icon: 'inventory_2', matches: ['vendor.products.*'] },
            { route: 'vendor.inventory.index', label: 'Inventory', icon: 'warehouse', match: 'vendor.inventory.*' },
        ],
    },
    {
        label: 'Sales',
        links: [
            { route: 'vendor.orders.index', label: 'Orders', icon: 'local_shipping', matches: ['vendor.orders.*'] },
            { route: 'vendor.finance.index', label: 'Earnings', icon: 'account_balance_wallet', match: 'vendor.finance.*' },
            { route: 'vendor.payouts.index', label: 'Payouts', icon: 'payments', match: 'vendor.payouts.*' },
            { route: 'vendor.promotions.index', label: 'Promotions', icon: 'sell', matches: ['vendor.promotions.*'] },
            { route: 'vendor.reviews.index', label: 'Reviews', icon: 'reviews', match: 'vendor.reviews.*' },
        ],
    },
    {
        label: 'Account',
        links: [
            { route: 'vendor.tickets.index', label: 'Messages', icon: 'forum', matches: ['vendor.tickets.*'] },
            { route: 'vendor.notifications.index', label: 'Notifications', icon: 'notifications', match: 'vendor.notifications.*' },
            { route: 'vendor.reports', label: 'Reports', icon: 'monitoring', match: 'vendor.reports' },
            { route: 'vendor.settings.edit', label: 'Settings', icon: 'manage_accounts', match: 'vendor.settings.*' },
        ],
    },
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

                <nav className="flex-1 space-y-4 overflow-y-auto p-3 text-sm">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-primary-fixed">{group.label}</div>
                            <div className="space-y-1">
                                {group.links.map((link) => (
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
                                        <span className="flex-1">{link.label}</span>
                                        {link.route === 'vendor.notifications.index' && auth.user?.unread_notifications > 0 && (
                                            <span className="rounded-full bg-white px-1.5 text-[10px] font-bold text-primary">{auth.user.unread_notifications}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
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
                    {auth.user?.is_vendor && auth.user?.shop_status && auth.user.shop_status !== 'active' && (
                        <div className="mb-4 rounded-xl bg-secondary-container/15 px-4 py-3 text-sm font-semibold text-secondary">
                            This shop is {auth.user.shop_status}. An admin must activate it before products can be published or payouts requested.
                        </div>
                    )}
                    {flash?.status && (
                        <div className="mb-4 rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">
                            {flash.status}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {flash.error}
                        </div>
                    )}
                    <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary">
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">{title}</div>
                        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{heading}</h2>
                    </section>
                    {children}
                </main>
            </div>
        </div>
    );
}
