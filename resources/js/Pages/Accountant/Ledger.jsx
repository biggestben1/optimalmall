import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Ledger({ accounts, entries }) {
    return (
        <AccountantLayout title="General ledger" heading="General ledger" intro="Account balances and the journal entries that created them.">
            <div className="card-surface mb-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Account</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Balance</th></tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {accounts.length === 0 && <tr><td className="px-4 py-6 text-on-surface-variant" colSpan="4">No accounts yet.</td></tr>}
                        {accounts.map((account) => (
                            <tr key={account.code}>
                                <td className="px-4 py-3">{account.code}</td>
                                <td className="px-4 py-3">{account.name}</td>
                                <td className="px-4 py-3">{account.type}</td>
                                <td className="px-4 py-3">{account.balance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <h2 className="mb-3 font-display text-lg font-bold">Journal entries</h2>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr><th className="px-4 py-3">Posted</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Description</th></tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {entries.data.length === 0 && <tr><td className="px-4 py-6 text-on-surface-variant" colSpan="3">No journal entries yet.</td></tr>}
                        {entries.data.map((entry) => (
                            <tr key={entry.reference}>
                                <td className="px-4 py-3">{entry.posted_at}</td>
                                <td className="px-4 py-3 font-semibold">{entry.reference}</td>
                                <td className="px-4 py-3">{entry.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={entries.links} />
        </AccountantLayout>
    );
}
