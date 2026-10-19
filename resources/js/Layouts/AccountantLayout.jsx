import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ApplicationLogo from '../Components/ApplicationLogo';

const groups = [
    {
        label: 'Overview',
        links: [
            ['accountant.dashboard', 'Dashboard', 'dashboard'],
            ['accountant.reports', 'Reports', 'insights'],
        ],
    },
    {
        label: 'Money in',
        links: [
            ['accountant.funding', 'Funding receipts', 'upload_file'],
            ['accountant.transactions', 'Transactions', 'receipt_long'],
            ['accountant.reconciliation', 'Reconciliation', 'rule'],
        ],
    },
    {
        label: 'Money out',
        links: [
            ['accountant.payouts', 'Payouts', 'payments'],
            ['accountant.refunds', 'Refunds', 'undo'],
            ['accountant.expenses', 'Expenses', 'request_quote'],
        ],
    },
    {
        label: 'Books',
        links: [
            ['accountant.wallets', 'Wallets', 'account_balance_wallet'],
            ['accountant.ledger', 'Ledger', 'menu_book'],
            ['accountant.periods', 'Period closing', 'event_available'],
        ],
    },
];

function isDesktop() {
    return window.matchMedia('(min-width: 1024px)').matches;
}

export default function AccountantLayout({ title, heading, children }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window === 'undefined' ? true : isDesktop()));
    const isSuperAdmin = auth.user?.role === 'super_admin';

    return (
        <div className={`min-h-screen bg-surface-container-low text-on-surface ${sidebarOpen ? 'lg:grid lg:grid-cols-[260px_1fr]' : ''}`}>
            {sidebarOpen && (
                <button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] transform bg-primary text-on-primary transition-transform duration-200 ${sidebarOpen ? 'translate-x-0 lg:static' : '-translate-x-full lg:hidden'}`}>
                <div className="border-b border-white/10 px-5 py-5">
                    <ApplicationLogo href={route('accountant.dashboard')} showTagline={false} size="sm" inverted />
                    <div className="mt-1 pl-10 text-xs text-primary-fixed">Accounting</div>
                </div>
                <nav className="max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto p-3 text-sm">
                    {groups.map((group) => (
                        <div key={group.label}>
                            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-primary-fixed">{group.label}</div>
                            <div className="space-y-1">
                                {group.links.map(([routeName, label, icon]) => (
                                    <Link
                                        key={routeName}
                                        href={route(routeName)}
                                        className={`flex items-center gap-2 rounded-lg px-3 py-2 ${route().current(routeName) ? 'bg-white/15 font-bold' : 'hover:bg-white/10'}`}
                                        onClick={() => { if (!isDesktop()) setSidebarOpen(false); }}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isSuperAdmin && (
                        <div>
                            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-primary-fixed">Admin</div>
                            <Link href={route('accountant.policy')} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${route().current('accountant.policy') ? 'bg-white/15 font-bold' : 'hover:bg-white/10'}`}>
                                <span className="material-symbols-outlined text-[18px]">policy</span>
                                Policy
                            </Link>
                            <Link href={route('admin.dashboard')} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10">
                                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                                Master admin
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>

            <div className="min-w-0">
                <header className="flex items-center justify-between border-b border-surface-container bg-surface-container-lowest px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <button type="button" className="rounded-lg p-1 hover:bg-surface-container-low" aria-label={sidebarOpen ? 'Close menu' : 'Open menu'} onClick={() => setSidebarOpen((open) => !open)}>
                            <span className="material-symbols-outlined">{sidebarOpen ? 'menu_open' : 'menu'}</span>
                        </button>
                        <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{title}</div>
                            <h1 className="truncate font-display text-xl font-bold">{heading}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden max-w-40 truncate font-semibold sm:inline">{auth.user?.name}</span>
                        <Link href={route('logout')} method="post" as="button" className="whitespace-nowrap font-bold text-primary">Log out</Link>
                    </div>
                </header>
                <main className="p-4 sm:p-6">
                    <Head title={title} />
                    {flash?.status && <p className="mb-4 rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{flash.status}</p>}
                    {flash?.error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{flash.error}</p>}
                    {children}
                </main>
            </div>
        </div>
    );
}
