import { Link } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';

export default function Dashboard({ stats }) {
    return (
        <AccountantLayout title="Accountant" heading="Financial position">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-surface p-4">
                        <p className="text-sm text-on-surface-variant">{stat.label}</p>
                        <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>
            <p className="mt-6 text-sm text-on-surface-variant">Customer and seller balances are liabilities. They are not marketplace profit.</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                <Link className="text-primary" href={route('accountant.transactions')}>Review transactions</Link>
                <Link className="text-primary" href={route('accountant.reconciliation')}>Reconcile</Link>
                <Link className="text-primary" href={route('accountant.payouts')}>Payout queue</Link>
                <Link className="text-primary" href={route('accountant.funding')}>Funding receipts</Link>
            </div>
        </AccountantLayout>
    );
}
