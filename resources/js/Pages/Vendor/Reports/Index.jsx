import { Head } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';

export default function Index({ shopName, stats, byProduct, recent }) {
    return (
        <VendorLayout title="Insights" heading="Sales report">
            <Head title="Sales report" />
            <div className="space-y-6">
                <p className="text-sm text-on-surface-variant">Sales for {shopName}.</p>
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
                        <div className="border-b border-surface-container px-4 py-3">
                            <h2 className="font-display text-lg font-bold">By product</h2>
                        </div>
                        <table className="min-w-full text-left text-sm">
                            <tbody className="divide-y divide-surface-container">
                                {byProduct.length === 0 ? (
                                    <tr><td className="px-4 py-8 text-center text-on-surface-variant">No sales yet.</td></tr>
                                ) : byProduct.map((product) => (
                                    <tr key={product.title}>
                                        <td className="px-4 py-3 font-semibold">{product.title}</td>
                                        <td className="px-4 py-3">{product.units} sold</td>
                                        <td className="px-4 py-3 text-right">{product.revenue}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    <section className="card-surface overflow-x-auto">
                        <div className="border-b border-surface-container px-4 py-3">
                            <h2 className="font-display text-lg font-bold">Recent sales</h2>
                        </div>
                        <table className="min-w-full text-left text-sm">
                            <tbody className="divide-y divide-surface-container">
                                {recent.length === 0 ? (
                                    <tr><td className="px-4 py-8 text-center text-on-surface-variant">No sales yet.</td></tr>
                                ) : recent.map((sale) => (
                                    <tr key={sale.id}>
                                        <td className="px-4 py-3 font-semibold">{sale.order_number}</td>
                                        <td className="px-4 py-3">{sale.title} × {sale.quantity}</td>
                                        <td className="px-4 py-3">{sale.placed_at}</td>
                                        <td className="px-4 py-3 text-right">{sale.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </VendorLayout>
    );
}
