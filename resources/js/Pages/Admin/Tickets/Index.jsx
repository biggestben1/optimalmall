import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FilterBar from '../../../Components/Admin/FilterBar';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ tickets, filters, statuses }) {
    return (
        <AdminLayout title="Support" heading="Messages">
            <Head title="Messages" />
            <p className="mb-4 text-sm text-on-surface-variant">Seller support tickets. Replies are stored on the same ticket the seller sees.</p>
            <FilterBar action={route('admin.tickets.index')} filters={filters} placeholder="Subject or customer">
                <select name="status" defaultValue={filters.status ?? ''} className="rounded-xl border-outline-variant text-sm">
                    <option value="">Any status</option>
                    {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
            </FilterBar>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Seller</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {tickets.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No messages yet.</td></tr>
                        ) : tickets.data.map((ticket) => (
                            <tr key={ticket.id}>
                                <td className="px-4 py-3 font-semibold">{ticket.subject}</td>
                                <td className="px-4 py-3">{ticket.vendor || '—'}</td>
                                <td className="px-4 py-3">{ticket.customer || '—'}</td>
                                <td className="px-4 py-3">{ticket.status_label}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={route('admin.tickets.show', ticket.id)} className="font-bold text-primary">Open</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={tickets.links} />
        </AdminLayout>
    );
}
