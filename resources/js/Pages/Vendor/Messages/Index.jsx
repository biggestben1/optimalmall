import { Head, Link } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import Pagination from '../../../Components/Admin/Pagination';
import SearchForm from '../../../Components/Vendor/SearchForm';

export default function Index({ tickets, filters = {} }) {
    return (
        <VendorLayout title="Support" heading="Messages">
            <Head title="Messages" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Support tickets and customer conversations for your shop.</p>
                <Link href={route('vendor.tickets.create')} className="btn-primary">New message</Link>
            </div>
            <SearchForm action={route('vendor.tickets.index')} values={filters}>
                <select name="status" defaultValue={filters.status ?? ''} className="rounded-xl border-outline-variant">
                    <option value="">Any status</option>
                    <option value="open">Open</option>
                    <option value="pending">Waiting</option>
                    <option value="closed">Closed</option>
                </select>
            </SearchForm>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {tickets.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No messages yet.</td></tr>
                        ) : tickets.data.map((ticket) => (
                            <tr key={ticket.id}>
                                <td className="px-4 py-3 font-semibold">{ticket.subject}</td>
                                <td className="px-4 py-3">{ticket.customer_name || 'Marketplace support'}</td>
                                <td className="px-4 py-3">{ticket.status_label}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={route('vendor.tickets.show', ticket.id)} className="font-bold text-primary">Open</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={tickets.links} />
        </VendorLayout>
    );
}
