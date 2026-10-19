import { Head } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';

export default function Index({ summary, lines, rate }) {
    const cards = [
        ['Verified sales', summary.gross_label],
        ['Commission', summary.commission_label],
        ['Refunds', summary.refunds_label],
        ['Net earnings', summary.net_label],
        ['Pending earnings', summary.unverified_label],
        ['Available earnings', summary.available_label],
        ['Paid settlements', summary.paid_label],
        ['Wallet ledger', summary.wallet_label],
    ];

    return (
        <VendorLayout title="Finance" heading="Earnings">
            <Head title="Earnings" />
            <p className="mb-4 text-sm text-on-surface-variant">
                Commission is {rate}% and is calculated on the server from payments marked successful. Unverified orders are not earnings.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map(([label, value]) => (
                    <div key={label} className="card-surface p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</div>
                        <div className="mt-2 font-display text-3xl font-extrabold text-primary">{value}</div>
                    </div>
                ))}
            </div>
            <section className="card-surface mt-6 overflow-x-auto">
                <div className="border-b border-surface-container px-4 py-3">
                    <h2 className="font-display text-lg font-bold">Statement</h2>
                </div>
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Sales</th>
                            <th className="px-4 py-3">Commission</th>
                            <th className="px-4 py-3">Refund</th>
                            <th className="px-4 py-3">Net</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {lines.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No transactions yet.</td></tr>
                        ) : lines.map((line) => (
                            <tr key={line.order_id}>
                                <td className="px-4 py-3 font-semibold">{line.number}<div className="text-xs text-on-surface-variant">{line.placed_at}</div></td>
                                <td className="px-4 py-3">{line.payment_status}</td>
                                <td className="px-4 py-3">{line.gross_label}</td>
                                <td className="px-4 py-3">{line.commission_label}</td>
                                <td className="px-4 py-3">{line.refund_label}</td>
                                <td className="px-4 py-3">{line.net_label}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </VendorLayout>
    );
}
