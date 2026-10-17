import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ categories }) {
    return (
        <AdminLayout title="Catalogue" heading="Categories">
            <Head title="Categories" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Main categories and subcategories.</p>
                <Link href={route('admin.categories.create')} className="btn-primary">Add category</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Parent</th>
                            <th className="px-4 py-3">Sort</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {categories.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No categories yet.</td></tr>
                        ) : categories.data.map((category) => (
                            <tr key={category.id}>
                                <td className="px-4 py-3 font-semibold">{category.name}</td>
                                <td className="px-4 py-3">{category.parent_name || '—'}</td>
                                <td className="px-4 py-3">{category.sort_order}</td>
                                <td className="px-4 py-3">{category.is_active ? 'Active' : 'Inactive'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.categories.edit', category.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.categories.destroy', category.id)} confirmMessage="Delete this category?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={categories.links} />
        </AdminLayout>
    );
}
