import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ banners }) {
    return (
        <AdminLayout title="Content" heading="Banners">
            <Head title="Banners" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Homepage promotional banners.</p>
                <Link href={route('admin.banners.create')} className="btn-primary">Add banner</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Sort</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {banners.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No banners yet.</td></tr>
                        ) : banners.data.map((banner) => (
                            <tr key={banner.id}>
                                <td className="px-4 py-3 font-semibold">{banner.title}</td>
                                <td className="px-4 py-3">{banner.sort_order}</td>
                                <td className="px-4 py-3">{banner.is_active ? 'Active' : 'Inactive'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.banners.edit', banner.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.banners.destroy', banner.id)} confirmMessage="Delete this banner?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={banners.links} />
        </AdminLayout>
    );
}
