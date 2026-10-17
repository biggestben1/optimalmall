import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ customers }) {
    return (
        <AdminLayout title="Users" heading="Customers">
            <Head title="Customers" />
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {customers.data.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-8 text-center text-on-surface-variant">No customers yet.</td></tr>
                        ) : customers.data.map((customer) => (
                            <tr key={customer.id}>
                                <td className="px-4 py-3 font-semibold">{customer.name}</td>
                                <td className="px-4 py-3">{customer.email}</td>
                                <td className="px-4 py-3">{customer.joined_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={customers.links} />
        </AdminLayout>
    );
}
