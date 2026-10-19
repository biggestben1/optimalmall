import { router } from '@inertiajs/react';
import { useState } from 'react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Transactions({ transactions, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = (extra = {}) => router.get(route('accountant.transactions'), { ...filters, search, ...extra }, { preserveState: true, replace: true });

    return (
        <AccountantLayout title="Wallet transactions" heading="Wallet transactions" intro="Search movements by reference, or export the current list.">
            <form className="mb-4 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); apply(); }}>
                <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Reference or description" value={search} onChange={(event) => setSearch(event.target.value)} />
                <select className="rounded-lg border px-3 py-2 text-sm" value={filters.status ?? ''} onChange={(event) => apply({ status: event.target.value })}>
                    <option value="">Any status</option>
                    <option value="posted">Posted</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="reversed">Reversed</option>
                </select>
                <button className="btn-primary">Search</button>
                <a className="rounded-xl border border-surface-container bg-surface-container-lowest px-4 py-2 text-sm font-bold" href={`${route('accountant.transactions')}?export=1`}>Export</a>
            </form>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Owner</th>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {transactions.data.length === 0 && <tr><td className="px-4 py-6 text-on-surface-variant" colSpan="6">No transactions match this search.</td></tr>}
                        {transactions.data.map((row) => (
                            <tr key={row.id}>
                                <td className="px-4 py-3">{row.created_at}</td>
                                <td className="px-4 py-3">{row.owner}</td>
                                <td className="px-4 py-3 font-semibold">{row.reference}{row.suspicious ? ' · review' : ''}</td>
                                <td className="px-4 py-3">{row.type} · {row.direction}</td>
                                <td className="px-4 py-3">{row.amount}</td>
                                <td className="px-4 py-3">{row.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={transactions.links} />
        </AccountantLayout>
    );
}
