import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function Dashboard({ stats }) {
    const cards = [
        { key: 'products', label: 'Products' },
        { key: 'categories', label: 'Categories' },
        { key: 'vendors', label: 'Vendors' },
        { key: 'customers', label: 'Customers' },
        { key: 'banners', label: 'Banners' },
        { key: 'active_vendors', label: 'Active vendors' },
        { key: 'active_products', label: 'Active products' },
        { key: 'low_stock', label: 'Low stock' },
        { key: 'pending_vendors', label: 'Pending vendors' },
    ];

    return (
        <AdminLayout title="Overview" heading="Dashboard overview">
            <Head title="Admin Dashboard" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.key} className="card-surface p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{card.label}</div>
                        <div className="mt-2 font-display text-3xl font-extrabold text-primary">
                            {Number(stats[card.key] ?? 0).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
            <div className="card-surface mt-6 p-6">
                <h2 className="font-display text-lg font-bold">Catalogue control</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                    Manage products, categories, vendors, customers and homepage banners. Orders, payments and settlements arrive in later phases.
                </p>
            </div>
        </AdminLayout>
    );
}
