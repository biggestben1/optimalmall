import { useForm } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Reconcile({ rows }) {
    const form = useForm({ source: 'gateway', period_start: '', period_end: '', statement_amount: '', notes: '' });

    return (
        <AccountantLayout title="Reconciliation" heading="Payment reconciliation" intro="Compare a provider or bank statement with the payments already posted.">
            <form className="card-surface mb-6 grid gap-3 p-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); form.post(route('accountant.reconciliation')); }}>
                <select className="rounded-lg border px-3 py-2 text-sm" value={form.data.source} onChange={(event) => form.setData('source', event.target.value)}>
                    <option value="gateway">Payment provider</option>
                    <option value="bank">Bank statement</option>
                </select>
                <input className="rounded-lg border px-3 py-2 text-sm" type="number" step="0.01" placeholder="Statement amount" value={form.data.statement_amount} onChange={(event) => form.setData('statement_amount', event.target.value)} required />
                <input className="rounded-lg border px-3 py-2 text-sm" type="date" value={form.data.period_start} onChange={(event) => form.setData('period_start', event.target.value)} required />
                <input className="rounded-lg border px-3 py-2 text-sm" type="date" value={form.data.period_end} onChange={(event) => form.setData('period_end', event.target.value)} required />
                <textarea className="rounded-lg border px-3 py-2 text-sm md:col-span-2" placeholder="Notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                <button className="btn-primary w-fit" disabled={form.processing}>Compare with posted payments</button>
            </form>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Period</th><th className="px-4 py-3">Expected</th><th className="px-4 py-3">Statement</th><th className="px-4 py-3">Difference</th><th className="px-4 py-3">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {rows.data.length === 0 && <tr><td className="px-4 py-6 text-on-surface-variant" colSpan="7">No reconciliations yet.</td></tr>}
                        {rows.data.map((row) => (
                            <tr key={row.id}>
                                <td className="px-4 py-3 font-semibold">{row.reference}</td>
                                <td className="px-4 py-3">{row.source}</td>
                                <td className="px-4 py-3">{row.period}</td>
                                <td className="px-4 py-3">{row.expected}</td>
                                <td className="px-4 py-3">{row.statement}</td>
                                <td className="px-4 py-3">{row.difference}</td>
                                <td className="px-4 py-3">{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={rows.links} />
        </AccountantLayout>
    );
}
