import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ available_label, bank, payouts }) {
    const bankForm = useForm({
        bank_name: bank?.bank_name ?? '',
        account_name: bank?.account_name ?? '',
        account_number: bank?.account_number ?? '',
    });
    const payoutForm = useForm({ amount: '', note: '' });

    return (
        <VendorLayout title="Finance" heading="Payouts">
            <Head title="Payouts" />
            <p className="mb-4 text-sm text-on-surface-variant">Available from verified payments: {available_label}. Payouts stay requested until an admin releases them.</p>
            <div className="grid gap-4 lg:grid-cols-2">
                <form onSubmit={(event) => { event.preventDefault(); bankForm.put(route('vendor.bank.update')); }} className="card-surface space-y-4 p-6">
                    <h2 className="font-display text-lg font-bold">Bank details</h2>
                    {['bank_name', 'account_name', 'account_number'].map((key) => (
                        <div key={key}>
                            <label className="mb-1 block text-xs font-bold uppercase">{key.replaceAll('_', ' ')}</label>
                            <input value={bankForm.data[key]} onChange={(e) => bankForm.setData(key, e.target.value)} className="w-full rounded-xl border-outline-variant" />
                            <InputError message={bankForm.errors[key]} />
                        </div>
                    ))}
                    <button type="submit" className="btn-primary" disabled={bankForm.processing}>Save bank</button>
                </form>
                <form onSubmit={(event) => { event.preventDefault(); payoutForm.post(route('vendor.payouts.store')); }} className="card-surface space-y-4 p-6">
                    <h2 className="font-display text-lg font-bold">Request payout</h2>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Amount (NGN)</label>
                        <input type="number" min="1" step="0.01" value={payoutForm.data.amount} onChange={(e) => payoutForm.setData('amount', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={payoutForm.errors.amount} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Note</label>
                        <input value={payoutForm.data.note} onChange={(e) => payoutForm.setData('note', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={payoutForm.errors.note} />
                    </div>
                    <InputError message={payoutForm.errors.bank} />
                    <button type="submit" className="btn-primary" disabled={payoutForm.processing}>Request</button>
                </form>
            </div>
            <section className="card-surface mt-6 overflow-x-auto">
                <div className="border-b border-surface-container px-4 py-3">
                    <h2 className="font-display text-lg font-bold">History</h2>
                </div>
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {payouts.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No payouts yet.</td></tr>
                        ) : payouts.data.map((payout) => (
                            <tr key={payout.id}>
                                <td className="px-4 py-3 font-semibold">{payout.reference}</td>
                                <td className="px-4 py-3">{payout.amount_label}</td>
                                <td className="px-4 py-3">{payout.status_label}{payout.rejection_reason ? ` — ${payout.rejection_reason}` : ''}</td>
                                <td className="px-4 py-3">{payout.paid_at || payout.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            <Pagination links={payouts.links} />
        </VendorLayout>
    );
}
