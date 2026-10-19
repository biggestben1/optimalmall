import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Index({ stats, recentOrders, topProducts, vendors = [], customers = [], filters = {} }) {
    function apply(event) {
        event.preventDefault();
        router.get(route('admin.reports'), Object.fromEntries(new FormData(event.currentTarget).entries()), { preserveState: true, replace: true });
    }

    return (
        <AdminLayout title="Insights" heading="Reports">
            <Head title="Reports" />
            <form onSubmit={apply} className="mb-4 flex flex-wrap items-end gap-2">
                <label className="text-sm">
                    <span className="mb-1 block text-xs font-bold uppercase">From</span>
                    <input type="date" name="from" defaultValue={filters.from ?? ''} className="rounded-xl border-outline-variant" />
                </label>
                <label className="text-sm">
                    <span className="mb-1 block text-xs font-bold uppercase">To</span>
                    <input type="date" name="to" defaultValue={filters.to ?? ''} className="rounded-xl border-outline-variant" />
                </label>
                <button type="submit" className="btn-primary">Apply range</button>
            </form>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-surface p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{stat.label}</div>
                        <div className="mt-2 font-display text-3xl font-extrabold text-primary">{stat.value}</div>
                    </div>
                ))}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="card-surface overflow-x-auto">
                    <h2 className="px-4 pt-4 font-display text-lg font-bold">Recent orders</h2>
                    <table className="min-w-full text-left text-sm">
                        <tbody className="divide-y divide-surface-container">
                            {recentOrders.length === 0 ? (
                                <tr><td className="px-4 py-8 text-center text-on-surface-variant">No orders yet.</td></tr>
                            ) : recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-4 py-3 font-semibold">
                                        <Link href={route('admin.orders.show', order.id)} className="text-primary">{order.number}</Link>
                                    </td>
                                    <td className="px-4 py-3">{order.customer_name}</td>
                                    <td className="px-4 py-3">{order.status}</td>
                                    <td className="px-4 py-3 text-right">{order.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card-surface overflow-x-auto">
                    <h2 className="px-4 pt-4 font-display text-lg font-bold">Top products</h2>
                    <table className="min-w-full text-left text-sm">
                        <tbody className="divide-y divide-surface-container">
                            {topProducts.length === 0 ? (
                                <tr><td className="px-4 py-8 text-center text-on-surface-variant">No product sales yet.</td></tr>
                            ) : topProducts.map((product) => (
                                <tr key={product.title}>
                                    <td className="px-4 py-3 font-semibold">{product.title}</td>
                                    <td className="px-4 py-3">{product.units} sold</td>
                                    <td className="px-4 py-3 text-right">{product.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="card-surface overflow-x-auto">
                    <h2 className="px-4 pt-4 font-display text-lg font-bold">Sellers</h2>
                    <table className="min-w-full text-left text-sm">
                        <tbody className="divide-y divide-surface-container">
                            {vendors.length === 0 ? (
                                <tr><td className="px-4 py-8 text-center text-on-surface-variant">No seller sales in this range.</td></tr>
                            ) : vendors.map((vendor) => (
                                <tr key={vendor.name}>
                                    <td className="px-4 py-3 font-semibold">{vendor.name}</td>
                                    <td className="px-4 py-3">{vendor.units} units</td>
                                    <td className="px-4 py-3 text-right">{vendor.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="card-surface overflow-x-auto">
                    <h2 className="px-4 pt-4 font-display text-lg font-bold">Customers</h2>
                    <table className="min-w-full text-left text-sm">
                        <tbody className="divide-y divide-surface-container">
                            {customers.length === 0 ? (
                                <tr><td className="px-4 py-8 text-center text-on-surface-variant">No customer orders in this range.</td></tr>
                            ) : customers.map((customer) => (
                                <tr key={customer.email}>
                                    <td className="px-4 py-3 font-semibold">{customer.name}</td>
                                    <td className="px-4 py-3">{customer.orders} orders</td>
                                    <td className="px-4 py-3 text-right">{customer.spent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
