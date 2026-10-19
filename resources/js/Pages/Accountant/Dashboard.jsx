import { Link } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';

const icons = {
    'Payments received': 'payments',
    Refunds: 'undo',
    'Commission income': 'percent',
    'Seller payables': 'storefront',
    'Customer wallet liabilities': 'account_balance_wallet',
    'Pending payouts': 'schedule',
    'Gateway fees': 'toll',
    'Bank settlement': 'account_balance',
    'Provider clearing': 'sync',
    'Unreconciled items': 'rule',
    'Funding receipts waiting': 'upload_file',
};

const shortcuts = [
    ['accountant.funding', 'Funding receipts', 'upload_file', 'Approve transfers before a wallet is credited'],
    ['accountant.transactions', 'Transactions', 'receipt_long', 'Search posted, pending, and failed movements'],
    ['accountant.reconciliation', 'Reconcile', 'rule', 'Match provider payments to the books'],
    ['accountant.payouts', 'Payout queue', 'payments', 'Approve a request before any bank payment'],
];

export default function Dashboard({ stats }) {
    return (
        <AccountantLayout title="Accountant" heading="Financial position">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary lg:p-8">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Accounting</div>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Financial position</h2>
                <p className="mt-2 max-w-2xl text-sm text-primary-fixed">Customer and seller balances are liabilities. They are not marketplace profit.</p>
            </section>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {shortcuts.map(([routeName, label, icon, detail]) => (
                    <Link key={routeName} href={route(routeName)} className="card-surface flex gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
                            <span className="material-symbols-outlined">{icon}</span>
                        </span>
                        <span>
                            <span className="block font-display font-bold">{label}</span>
                            <span className="mt-1 block text-sm text-on-surface-variant">{detail}</span>
                        </span>
                    </Link>
                ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-surface p-4">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px] text-primary">{icons[stat.label] || 'monitoring'}</span>
                            {stat.label}
                        </div>
                        <p className="mt-2 font-display text-2xl font-extrabold text-primary">{stat.value}</p>
                    </div>
                ))}
            </div>
        </AccountantLayout>
    );
}
