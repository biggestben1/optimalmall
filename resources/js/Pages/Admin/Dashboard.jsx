import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

const cards = [
    { key: 'revenue', label: 'Verified sales', hint: 'Paid orders only' },
    { key: 'commission', label: 'Marketplace commission', hint: 'Platform revenue' },
    { key: 'vendor_funds', label: 'Seller funds available', hint: 'Owed after commission, refunds, and payouts' },
    { key: 'orders', label: 'Orders' },
    { key: 'open_orders', label: 'Open orders' },
    { key: 'pending_payouts', label: 'Payouts waiting' },
    { key: 'pending_products', label: 'Products awaiting approval' },
    { key: 'pending_vendors', label: 'Sellers awaiting verification' },
    { key: 'low_stock', label: 'Low stock' },
    { key: 'open_tickets', label: 'Open messages' },
    { key: 'products', label: 'Products' },
    { key: 'active_products', label: 'Active products' },
    { key: 'vendors', label: 'Sellers' },
    { key: 'active_vendors', label: 'Active sellers' },
    { key: 'customers', label: 'Customers' },
];

export default function Dashboard({ stats }) {
    const modules = usePage().props.auth.user?.admin_modules ?? [];
    const links = [
        modules.includes('reports') ? ['admin.reports', 'Open reports'] : null,
        modules.includes('finance') ? ['admin.payments.index', 'Review payouts'] : null,
        modules.includes('catalogue') ? ['admin.products.index', 'Approve listings'] : null,
    ].filter(Boolean);

    return (
        <AdminLayout title="Overview" heading="Marketplace dashboard">
            <Head title="Admin Dashboard" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.key} className="card-surface p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{card.label}</div>
                        <div className="mt-2 font-display text-3xl font-extrabold text-primary">
                            {typeof stats[card.key] === 'number'
                                ? Number(stats[card.key]).toLocaleString()
                                : stats[card.key]}
                        </div>
                        {card.hint && <p className="mt-2 text-xs text-on-surface-variant">{card.hint}</p>}
                    </div>
                ))}
            </div>
            <div className="card-surface mt-6 p-6 text-sm text-on-surface-variant">
                <h2 className="font-display text-lg font-bold text-on-surface">Same marketplace books</h2>
                <p className="mt-2">
                    Commissions, seller balances, and payouts use the verified payments already recorded for each shop.
                    Unverified payments are not treated as earnings.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    {links.map(([name, label]) => (
                        <Link key={name} href={route(name)} className="font-bold text-primary">{label}</Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
