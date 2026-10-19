import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Admin/Pagination';

function StatusForm({ item, statuses }) {
    const { data, setData, patch, processing } = useForm({
        status: item.status,
        notes: item.notes ?? '',
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                patch(route('admin.returns.update', item.id));
            }}
            className="flex flex-wrap items-center justify-end gap-2"
        >
            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="rounded-lg border-outline-variant text-sm">
                {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <button type="submit" className="font-bold text-primary" disabled={processing}>Save</button>
        </form>
    );
}

export default function Index({ returns, statuses }) {
    return (
        <AdminLayout title="Sales" heading="Returns">
            <Head title="Returns" />
            <p className="mb-4 text-sm text-on-surface-variant">Approve, reject, or refund customer returns.</p>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Reason</th>
                            <th className="px-4 py-3">Refund</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {returns.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No returns yet.</td></tr>
                        ) : returns.data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 font-semibold">{item.order_number}</td>
                                <td className="px-4 py-3">{item.reason}</td>
                                <td className="px-4 py-3">{item.refund_amount}</td>
                                <td className="px-4 py-3">
                                    <StatusForm item={item} statuses={statuses} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={returns.links} />
        </AdminLayout>
    );
}
