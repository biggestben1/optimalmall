import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Refunds({ returns }) {
    return (
        <AccountantLayout title="Refunds" heading="Refund accounting">
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ledger</th></tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {returns.data.map((row) => (
                            <tr key={row.id}>
                                <td className="px-4 py-3 font-semibold">{row.order}</td>
                                <td className="px-4 py-3">{row.amount}</td>
                                <td className="px-4 py-3">{row.status}</td>
                                <td className="px-4 py-3">{row.posted ? 'Posted' : 'Not posted'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={returns.links} />
        </AccountantLayout>
    );
}
