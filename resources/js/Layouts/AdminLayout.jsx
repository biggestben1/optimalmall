import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '../Components/ApplicationLogo';

const groups = [
    {
        label: 'Overview',
        links: [
            { route: 'admin.dashboard', label: 'Dashboard', icon: 'dashboard', match: 'admin.dashboard', module: 'dashboard' },
        ],
    },
    {
        label: 'People',
        links: [
            { route: 'admin.vendors.index', label: 'Sellers', icon: 'storefront', match: 'admin.vendors.*', module: 'vendors' },
            { route: 'admin.customers.index', label: 'Customers', icon: 'group', match: 'admin.customers.*', module: 'customers' },
            { route: 'admin.roles.index', label: 'Staff & roles', icon: 'admin_panel_settings', match: 'admin.roles.*', module: 'staff' },
        ],
    },
    {
        label: 'Catalogue',
        links: [
            { route: 'admin.products.index', label: 'Products', icon: 'inventory_2', match: 'admin.products.*', module: 'catalogue' },
            { route: 'admin.categories.index', label: 'Categories', icon: 'category', match: 'admin.categories.*', module: 'catalogue' },
            { route: 'admin.brands.index', label: 'Brands', icon: 'sell', match: 'admin.brands.*', module: 'catalogue' },
        ],
    },
    {
        label: 'Sales',
        links: [
            { route: 'admin.orders.index', label: 'Orders', icon: 'receipt_long', match: 'admin.orders.*', module: 'orders' },
            { route: 'admin.inventory.index', label: 'Inventory', icon: 'warehouse', match: 'admin.inventory.*', module: 'inventory' },
            { route: 'admin.shipping.index', label: 'Shipping', icon: 'local_shipping', match: 'admin.shipping.*', module: 'inventory' },
        ],
    },
    {
        label: 'Finance',
        links: [
            { route: 'accountant.dashboard', label: 'Accounting', icon: 'account_balance', match: 'accountant.*', module: 'finance' },
            { route: 'admin.payments.index', label: 'Payments & payouts', icon: 'payments', match: 'admin.payments.*', module: 'finance' },
            { route: 'admin.commissions.index', label: 'Commissions', icon: 'percent', match: 'admin.commissions.*', module: 'finance' },
        ],
    },
    {
        label: 'Growth',
        links: [
            { route: 'admin.coupons.index', label: 'Coupons', icon: 'confirmation_number', match: 'admin.coupons.*', module: 'promotions' },
            { route: 'admin.advertisements.index', label: 'Advertising', icon: 'campaign', match: 'admin.advertisements.*', module: 'promotions' },
            { route: 'admin.banners.index', label: 'Banners', icon: 'image', match: 'admin.banners.*', module: 'promotions' },
        ],
    },
    {
        label: 'Content',
        links: [
            { route: 'admin.pages.index', label: 'Pages', icon: 'article', match: 'admin.pages.*', module: 'content' },
            { route: 'admin.posts.index', label: 'Blog', icon: 'newspaper', match: 'admin.posts.*', module: 'content' },
        ],
    },
    {
        label: 'Support',
        links: [
            { route: 'admin.tickets.index', label: 'Messages', icon: 'forum', match: 'admin.tickets.*', module: 'support' },
            { route: 'admin.returns.index', label: 'Returns', icon: 'assignment_return', match: 'admin.returns.*', module: 'support' },
            { route: 'admin.reviews.index', label: 'Reviews', icon: 'reviews', match: 'admin.reviews.*', module: 'support' },
        ],
    },
    {
        label: 'Insights',
        links: [
            { route: 'admin.reports', label: 'Reports', icon: 'monitoring', match: 'admin.reports', module: 'reports' },
            { route: 'admin.notifications.index', label: 'Notifications', icon: 'notifications', match: 'admin.notifications.*', module: 'notifications' },
            { route: 'admin.audit.index', label: 'Audit log', icon: 'history', match: 'admin.audit.*', module: 'audit' },
        ],
    },
    {
        label: 'System',
        links: [
            { route: 'admin.settings.edit', label: 'Settings', icon: 'settings', match: 'admin.settings.*', module: 'settings' },
            { route: 'admin.security.edit', label: 'Two-factor', icon: 'shield', match: 'admin.security.*', module: null },
        ],
    },
];

const sidebarStorageKey = 'admin-sidebar';

function isActive(match) {
    return route().current(match);
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

export default function AdminLayout({ title, heading, children }) {
    const { auth, flash } = usePage().props;
    const { post } = useForm({});
    const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
    const modules = auth.user?.admin_modules ?? [];

    function setSidebar(open, { persist = isDesktop() } = {}) {
        setSidebarOpen(open);

        if (persist) {
            window.localStorage.setItem(sidebarStorageKey, open ? 'open' : 'closed');
        }
    }

    const visibleGroups = groups
        .map((group) => ({
            ...group,
            links: group.links.filter((link) => link.module === null || modules.includes(link.module)),
        }))
        .filter((group) => group.links.length > 0);

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
                className={`fixed inset-y-0 left-0 z-50 w-[260px] transform bg-primary text-on-primary transition-transform duration-200 ${
                    sidebarOpen ? 'translate-x-0 lg:static' : '-translate-x-full lg:hidden'
                }`}
            >
                <div className="border-b border-white/10 px-5 py-5">
                    <ApplicationLogo href={route('admin.dashboard')} showTagline={false} size="sm" inverted />
                    <div className="mt-1 pl-10 text-xs text-primary-fixed">Master Admin</div>
                </div>

                <nav className="max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto p-3 text-sm">
                    {visibleGroups.map((group) => (
                        <div key={group.label}>
                            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-primary-fixed">{group.label}</div>
                            <div className="space-y-1">
                                {group.links.map((link) => (
                                    <Link
                                        key={link.route}
                                        href={route(link.route)}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                            isActive(link.match) ? 'bg-white/15 font-bold' : 'hover:bg-white/10'
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
                            </div>
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
                    {flash?.error && (
                        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                            {flash.error}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
