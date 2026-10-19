import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ pages }) {
    return (
        <AdminLayout title="Content" heading="Pages">
            <Head title="Pages" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Published pages are available on the storefront at /pages/their-slug.</p>
                <Link href={route('admin.pages.create')} className="btn-primary">Add page</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {pages.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No pages yet.</td></tr>
                        ) : pages.data.map((entry) => (
                            <tr key={entry.id}>
                                <td className="px-4 py-3 font-semibold">{entry.title}</td>
                                <td className="px-4 py-3">{entry.slug}</td>
                                <td className="px-4 py-3">{entry.is_published ? 'Published' : 'Draft'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.pages.edit', entry.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.pages.destroy', entry.id)} confirmMessage="Delete this page?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={pages.links} />
        </AdminLayout>
    );
}
