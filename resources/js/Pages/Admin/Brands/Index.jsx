import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import FilterBar from '../../../Components/Admin/FilterBar';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ brands, filters }) {
    return (
        <AdminLayout title="Catalogue" heading="Brands">
            <Head title="Brands" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Brands can be attached to any seller’s product.</p>
                <Link href={route('admin.brands.create')} className="btn-primary">Add brand</Link>
            </div>
            <FilterBar action={route('admin.brands.index')} filters={filters} placeholder="Brand name" />
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Products</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {brands.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No brands yet.</td></tr>
                        ) : brands.data.map((brand) => (
                            <tr key={brand.id}>
                                <td className="px-4 py-3 font-semibold">{brand.name}</td>
                                <td className="px-4 py-3">{brand.products_count}</td>
                                <td className="px-4 py-3">{brand.is_active ? 'Active' : 'Inactive'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.brands.edit', brand.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.brands.destroy', brand.id)} confirmMessage="Delete this brand?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={brands.links} />
        </AdminLayout>
    );
}
