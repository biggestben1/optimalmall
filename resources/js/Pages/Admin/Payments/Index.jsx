import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ payments, settlements }) {
    return (
        <AdminLayout title="Finance" heading="Payments & Settlements">
            <Head title="Payments & Settlements" />
            <h2 className="mb-3 font-display text-lg font-bold">Payments</h2>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Method</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Paid</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {payments.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No payments yet.</td></tr>
                        ) : payments.data.map((payment) => (
                            <tr key={payment.id}>
                                <td className="px-4 py-3 font-semibold">{payment.reference}</td>
                                <td className="px-4 py-3">{payment.order_number}</td>
                                <td className="px-4 py-3">{payment.method}</td>
                                <td className="px-4 py-3">{payment.amount}</td>
                                <td className="px-4 py-3">{payment.status}</td>
                                <td className="px-4 py-3">{payment.paid_at ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={payments.links} />

            <h2 className="mb-3 mt-8 font-display text-lg font-bold">Vendor settlements</h2>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Vendor</th>
                            <th className="px-4 py-3">Period</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {settlements.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No settlements yet.</td></tr>
                        ) : settlements.data.map((settlement) => (
                            <tr key={settlement.id}>
                                <td className="px-4 py-3 font-semibold">{settlement.reference}</td>
                                <td className="px-4 py-3">{settlement.vendor}</td>
                                <td className="px-4 py-3">{settlement.period}</td>
                                <td className="px-4 py-3">{settlement.amount}</td>
                                <td className="px-4 py-3">{settlement.status_label}</td>
                                <td className="px-4 py-3 text-right">
                                    {settlement.status === 'pending' && (
                                        <button
                                            type="button"
                                            className="font-bold text-primary"
                                            onClick={() => router.patch(route('admin.settlements.update', settlement.id))}
                                        >
                                            Mark paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={settlements.links} />
        </AdminLayout>
    );
}
