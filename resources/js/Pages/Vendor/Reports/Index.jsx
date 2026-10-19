import { Head } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';

export default function Index({ shop_name, stats = [], by_product = [], transactions = [] }) {
    return (
        <VendorLayout title="Insights" heading="Reports">
            <Head title="Reports" />
            <p className="mb-4 text-sm text-on-surface-variant">Sales, commission and transaction history for {shop_name}.</p>
            <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-surface p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{stat.label}</div>
                        <div className="mt-2 font-display text-3xl font-extrabold text-primary">{stat.value}</div>
                    </div>
                ))}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <section className="card-surface overflow-x-auto">
                    <div className="border-b border-surface-container px-4 py-3">
                        <h2 className="font-display text-lg font-bold">By product</h2>
                    </div>
                    <table className="min-w-full text-left text-sm">
                        <tbody className="divide-y divide-surface-container">
                            {by_product.length === 0 ? (
                                <tr><td className="px-4 py-8 text-center text-on-surface-variant">No sales yet.</td></tr>
                            ) : by_product.map((product) => (
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
                        <h2 className="font-display text-lg font-bold">Transactions</h2>
                    </div>
                    <table className="min-w-full text-left text-sm">
                        <tbody className="divide-y divide-surface-container">
                            {transactions.length === 0 ? (
                                <tr><td className="px-4 py-8 text-center text-on-surface-variant">No transactions yet.</td></tr>
                            ) : transactions.map((line) => (
                                <tr key={line.order_id}>
                                    <td className="px-4 py-3 font-semibold">{line.number}</td>
                                    <td className="px-4 py-3">{line.payment_status}</td>
                                    <td className="px-4 py-3 text-right">{line.net_label}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </VendorLayout>
    );
}
