import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Admin/Pagination';

function ConfirmPayout({ payout }) {
    const form = useForm({ password: '', provider_reference: '' });

    return (
        <form className="mt-2 flex flex-wrap justify-end gap-2" onSubmit={(event) => { event.preventDefault(); form.post(route('admin.payouts.confirm', payout.id)); }}>
            <input className="rounded-lg border px-2 py-1 text-xs" placeholder="Bank reference" value={form.data.provider_reference} onChange={(event) => form.setData('provider_reference', event.target.value)} required />
            <input className="rounded-lg border px-2 py-1 text-xs" type="password" placeholder="Your password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required />
            <button className="font-bold text-primary" disabled={form.processing}>Confirm settled</button>
        </form>
    );
}

export default function Index({ payments, settlements, payouts }) {
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
                                            onClick={() => {
                                                if (window.confirm('Mark this settlement paid? This cannot be repeated.')) {
                                                    router.patch(route('admin.settlements.update', settlement.id));
                                                }
                                            }}
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

            <h2 className="mb-3 mt-8 font-display text-lg font-bold">Payout requests</h2>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Seller</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {(payouts?.data ?? []).length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No payout requests yet.</td></tr>
                        ) : payouts.data.map((payout) => (
                            <tr key={payout.id}>
                                <td className="px-4 py-3 font-semibold">{payout.reference}</td>
                                <td className="px-4 py-3">{payout.vendor}</td>
                                <td className="px-4 py-3">{payout.amount}</td>
                                <td className="px-4 py-3">{payout.status_label}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    {payout.status === 'requested' && (
                                        <button type="button" className="font-bold text-primary" onClick={() => { if (window.confirm('Approve this payout? Approval does not pay the seller.')) router.patch(route('admin.payouts.approve', payout.id)); }}>Approve</button>
                                    )}
                                    {payout.status === 'approved' && (
                                        <button type="button" className="font-bold text-primary" onClick={() => { if (window.confirm('Start this payout with the bank? It stays unpaid until settlement is confirmed.')) router.patch(route('admin.payouts.release', payout.id)); }}>Start payment</button>
                                    )}
                                    {(payout.status === 'requested' || payout.status === 'approved') && (
                                        <button type="button" className="font-bold text-secondary" onClick={() => { if (window.confirm('Reject this payout?')) router.patch(route('admin.payouts.reject', payout.id)); }}>Reject</button>
                                    )}
                                    {payout.status === 'processing' && <ConfirmPayout payout={payout} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {payouts && <Pagination links={payouts.links} />}
        </AdminLayout>
    );
}
