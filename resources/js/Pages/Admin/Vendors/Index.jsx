import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ vendors }) {
    return (
        <AdminLayout title="Sellers" heading="Sellers">
            <Head title="Sellers" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Seller shops and the email each one uses to sign in.</p>
                <Link href={route('admin.vendors.create')} className="btn-primary">Add seller</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Shop</th>
                            <th className="px-4 py-3">Login email</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {vendors.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No sellers yet.</td></tr>
                        ) : vendors.data.map((vendor) => (
                            <tr key={vendor.id}>
                                <td className="px-4 py-3 font-semibold">{vendor.name}</td>
                                <td className="px-4 py-3">{vendor.can_login ? vendor.email : 'No login yet'}</td>
                                <td className="px-4 py-3">{[vendor.city, vendor.state].filter(Boolean).join(', ') || '—'}</td>
                                <td className="px-4 py-3">{vendor.status_label}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.vendors.edit', vendor.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.vendors.destroy', vendor.id)} confirmMessage="Delete this vendor?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={vendors.links} />
        </AdminLayout>
    );
}
