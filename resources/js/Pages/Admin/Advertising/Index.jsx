import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ advertisements }) {
    return (
        <AdminLayout title="Promotions" heading="Advertising">
            <Head title="Advertising" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Paid placements on the storefront.</p>
                <Link href={route('admin.advertisements.create')} className="btn-primary">Add advertisement</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Placement</th>
                            <th className="px-4 py-3">Budget</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {advertisements.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No advertisements yet.</td></tr>
                        ) : advertisements.data.map((ad) => (
                            <tr key={ad.id}>
                                <td className="px-4 py-3 font-semibold">{ad.title}</td>
                                <td className="px-4 py-3">{ad.placement}</td>
                                <td className="px-4 py-3">{ad.budget}</td>
                                <td className="px-4 py-3">{ad.is_active ? 'Active' : 'Inactive'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.advertisements.edit', ad.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.advertisements.destroy', ad.id)} confirmMessage="Delete this advertisement?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={advertisements.links} />
        </AdminLayout>
    );
}
