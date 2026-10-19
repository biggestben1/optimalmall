import { Head, Link, router, usePage } from '@inertiajs/react';

const links = [
    ['accountant.dashboard', 'Dashboard', 'dashboard'],
    ['accountant.transactions', 'Transactions', 'receipt_long'],
    ['accountant.wallets', 'Wallets', 'account_balance_wallet'],
    ['accountant.funding', 'Funding receipts', 'upload_file'],
    ['accountant.reconciliation', 'Reconciliation', 'rule'],
    ['accountant.payouts', 'Payouts', 'payments'],
    ['accountant.refunds', 'Refunds', 'undo'],
    ['accountant.expenses', 'Expenses', 'request_quote'],
    ['accountant.ledger', 'Ledger', 'menu_book'],
    ['accountant.reports', 'Reports', 'insights'],
    ['accountant.periods', 'Period closing', 'event_available'],
];

export default function AccountantLayout({ title, heading, children }) {
    const { auth, flash } = usePage().props;
    const policy = auth.user?.role === 'super_admin';

    return (
        <div className="min-h-screen bg-background text-on-surface md:grid md:grid-cols-[240px_1fr]">
            <aside className="border-b border-surface-container bg-surface md:min-h-screen md:border-b-0 md:border-r">
                <div className="flex items-center gap-2 px-4 py-4">
                    <span className="material-symbols-outlined text-primary">account_balance</span>
                    <div>
                        <p className="font-display text-sm font-bold">Accounting</p>
                        <p className="text-xs text-on-surface-variant">{auth.user?.name}</p>
                    </div>
                </div>
                <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:block md:space-y-1 md:px-3">
                    {links.map(([routeName, label, icon]) => (
                        <Link key={routeName} href={route(routeName)} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${route().current(routeName) ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                            {label}
                        </Link>
                    ))}
                    {policy && (
                        <Link href={route('accountant.policy')} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${route().current('accountant.policy') ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                            <span className="material-symbols-outlined text-[18px]">policy</span>
                            Policy
                        </Link>
                    )}
                    {auth.user?.role === 'super_admin' && (
                        <Link href={route('admin.dashboard')} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container">
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            Master admin
                        </Link>
                    )}
                    <button type="button" className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container" onClick={() => router.post(route('logout'))}>
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Log out
                    </button>
                </nav>
            </aside>
            <main className="px-4 py-6 md:px-8">
                <Head title={title} />
                <h1 className="mb-6 font-display text-2xl font-bold">{heading}</h1>
                {flash?.status && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{flash.status}</p>}
                {flash?.error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{flash.error}</p>}
                {children}
            </main>
        </div>
    );
}
