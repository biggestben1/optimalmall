import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Wallets({ wallets, filters, can_freeze, can_prepare, can_approve, adjustments }) {
    const [search, setSearch] = useState(filters.search ?? '');

    return (
        <AccountantLayout title="Wallets" heading="Customer and seller wallets">
            <form className="mb-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); router.get(route('accountant.wallets'), { search }, { preserveState: true }); }}>
                <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Search</button>
            </form>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {wallets.data.map((wallet) => (
                            <tr key={wallet.id}>
                                <td className="px-4 py-3 font-semibold">{wallet.owner}</td>
                                <td className="px-4 py-3">{wallet.type}</td>
                                <td className="px-4 py-3">{wallet.balance}</td>
                                <td className="px-4 py-3">{wallet.status}</td>
                                <td className="px-4 py-3 text-right">
                                    {can_freeze && <Freeze wallet={wallet} />}
                                    {can_prepare && <Adjust wallet={wallet} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={wallets.links} />
            <h2 className="mb-3 mt-8 font-display text-lg font-bold">Prepared adjustments</h2>
            <div className="space-y-3">
                {adjustments.map((adjustment) => (
                    <div key={adjustment.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                        <div>
                            <p className="font-semibold">{adjustment.owner} · {adjustment.direction} {adjustment.amount}</p>
                            <p className="text-on-surface-variant">{adjustment.reason} · {adjustment.status}</p>
                        </div>
                        {can_approve && adjustment.status === 'pending' && <Approve adjustment={adjustment} />}
                    </div>
                ))}
                {adjustments.length === 0 && <p className="text-sm text-on-surface-variant">No adjustments yet.</p>}
            </div>
        </AccountantLayout>
    );
}

function Freeze({ wallet }) {
    const form = useForm({ password: '' });

    return (
        <form className="inline-flex gap-2" onSubmit={(event) => { event.preventDefault(); form.post(route('accountant.wallets.freeze', wallet.id)); }}>
            <input className="rounded-lg border px-2 py-1 text-xs" type="password" placeholder="Password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required />
            <button className="font-bold text-secondary">{wallet.status === 'frozen' ? 'Unfreeze' : 'Freeze'}</button>
        </form>
    );
}

function Adjust({ wallet }) {
    const form = useForm({ direction: 'credit', amount: '', reason: '' });

    return (
        <form className="mt-2 flex flex-wrap justify-end gap-2" onSubmit={(event) => { event.preventDefault(); form.post(route('accountant.wallets.adjust', wallet.id)); }}>
            <select className="rounded-lg border px-2 py-1 text-xs" value={form.data.direction} onChange={(event) => form.setData('direction', event.target.value)}>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
            </select>
            <input className="w-24 rounded-lg border px-2 py-1 text-xs" placeholder="Amount" value={form.data.amount} onChange={(event) => form.setData('amount', event.target.value)} required />
            <input className="rounded-lg border px-2 py-1 text-xs" placeholder="Reason" value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} required />
            <button className="font-bold text-primary">Prepare</button>
        </form>
    );
}

function Approve({ adjustment }) {
    const form = useForm({ password: '' });

    return (
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); form.post(route('accountant.adjustments.approve', adjustment.id)); }}>
            <input className="rounded-lg border px-2 py-1 text-xs" type="password" placeholder="Password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required />
            <button className="font-bold text-primary">Approve</button>
        </form>
    );
}
