import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Wallets({ wallets, filters, account, can_freeze, can_prepare, can_approve, adjustments }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const funding = useForm({
        funding_bank: account?.bank ?? '',
        funding_account_name: account?.name ?? '',
        funding_account_number: account?.number ?? '',
    });

    return (
        <AccountantLayout title="Wallets" heading="Customer and seller wallets" intro="Balances here are money the mall owes. The top-up account below is what customers pay into before a receipt is approved.">
            <form className="card-surface mb-6 grid gap-3 p-5 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); funding.post(route('accountant.wallets.funding-account')); }}>
                <div className="md:col-span-3">
                    <div className="text-xs font-bold uppercase tracking-wide text-secondary">Top up</div>
                    <h2 className="font-display text-2xl font-bold">Account customers pay into</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">These details show on the customer wallet page. The balance changes only after a receipt is approved.</p>
                </div>
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Bank</span>
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2" value={funding.data.funding_bank} onChange={(event) => funding.setData('funding_bank', event.target.value)} required />
                    {funding.errors.funding_bank && <span className="text-red-700">{funding.errors.funding_bank}</span>}
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Account name</span>
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2" value={funding.data.funding_account_name} onChange={(event) => funding.setData('funding_account_name', event.target.value)} required />
                    {funding.errors.funding_account_name && <span className="text-red-700">{funding.errors.funding_account_name}</span>}
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Account number</span>
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2" value={funding.data.funding_account_number} onChange={(event) => funding.setData('funding_account_number', event.target.value)} required />
                    {funding.errors.funding_account_number && <span className="text-red-700">{funding.errors.funding_account_number}</span>}
                </label>
                <div className="md:col-span-3">
                    <button className="btn-primary" disabled={funding.processing}>Save top-up account</button>
                </div>
            </form>
            <form className="mb-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); router.get(route('accountant.wallets'), { search }, { preserveState: true }); }}>
                <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
                <button className="btn-primary">Search</button>
            </form>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {wallets.data.length === 0 && <tr><td className="px-4 py-6 text-on-surface-variant" colSpan="5">No wallets match this search.</td></tr>}
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
