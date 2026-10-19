import { Head, Link } from '@inertiajs/react';
import VendorLayout from '../../Layouts/VendorLayout';

export default function Dashboard({ shop, stats, products, orders, settlements }) {
    return (
        <VendorLayout title="Overview" heading="Dashboard">
            <Head title="Seller dashboard" />
            <div className="space-y-6">
                {shop === null ? (
                    <div className="card-surface p-6 text-sm text-on-surface-variant">
                        This login is not linked to a shop yet. Ask an OptimalMall admin to connect your vendor account.
                    </div>
                ) : (
                    <>
                        <div className="card-surface p-6">
                            <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{shop.status}</div>
                            <h1 className="mt-1 font-display text-2xl font-extrabold">{shop.name}</h1>
                            <p className="mt-1 text-sm text-on-surface-variant">{shop.email} · {shop.city}, {shop.state}</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {stats.map((stat) => (
                                <div key={stat.label} className="card-surface p-5">
                                    <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{stat.label}</div>
                                    <div className="mt-2 font-display text-3xl font-extrabold text-primary">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                            <section className="card-surface overflow-x-auto">
                                <div className="flex items-center justify-between border-b border-surface-container px-4 py-3">
                                    <h2 className="font-display text-lg font-bold">Products</h2>
                                    <Link href={route('vendor.products.index')} className="text-sm font-bold text-primary">View all</Link>
                                </div>
                                <table className="min-w-full text-left text-sm">
                                    <tbody className="divide-y divide-surface-container">
                                        {products.length === 0 ? (
                                            <tr><td className="px-4 py-8 text-center text-on-surface-variant">No products yet.</td></tr>
                                        ) : products.map((product) => (
                                            <tr key={product.id}>
                                                <td className="px-4 py-3 font-semibold">{product.title}</td>
                                                <td className="px-4 py-3">{product.stock} in stock</td>
                                                <td className="px-4 py-3 text-right">{product.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                            <section className="card-surface overflow-x-auto">
                                <div className="flex items-center justify-between border-b border-surface-container px-4 py-3">
                                    <h2 className="font-display text-lg font-bold">Recent orders</h2>
                                    <Link href={route('vendor.reports')} className="text-sm font-bold text-primary">Sales report</Link>
                                </div>
                                <table className="min-w-full text-left text-sm">
                                    <tbody className="divide-y divide-surface-container">
                                        {orders.length === 0 ? (
                                            <tr><td className="px-4 py-8 text-center text-on-surface-variant">No orders yet.</td></tr>
                                        ) : orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-4 py-3 font-semibold">{order.order_number}</td>
                                                <td className="px-4 py-3">{order.title} × {order.quantity}</td>
                                                <td className="px-4 py-3 text-right">{order.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        </div>
                        <section className="card-surface overflow-x-auto">
                            <div className="border-b border-surface-container px-4 py-3">
                                <h2 className="font-display text-lg font-bold">Settlements</h2>
                            </div>
                            <table className="min-w-full text-left text-sm">
                                <tbody className="divide-y divide-surface-container">
                                    {settlements.length === 0 ? (
                                        <tr><td className="px-4 py-8 text-center text-on-surface-variant">No settlements yet.</td></tr>
                                    ) : settlements.map((settlement) => (
                                        <tr key={settlement.id}>
                                            <td className="px-4 py-3 font-semibold">{settlement.reference}</td>
                                            <td className="px-4 py-3">{settlement.status}</td>
                                            <td className="px-4 py-3 text-right">{settlement.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    </>
                )}
            </div>
        </VendorLayout>
    );
}
