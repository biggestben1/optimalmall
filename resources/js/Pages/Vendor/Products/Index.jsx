import { Head, Link } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';
import SearchForm from '../../../Components/Vendor/SearchForm';

export default function Index({ products, filters = {} }) {
    return (
        <VendorLayout title="Catalogue" heading="Products">
            <Head title="Products" />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-on-surface-variant">Products for your shop. Publishing requires admin approval.</p>
                <Link href={route('vendor.products.create')} className="btn-primary">Add product</Link>
            </div>
            <SearchForm action={route('vendor.products.index')} values={filters}>
                <input name="q" defaultValue={filters.q ?? ''} placeholder="Search title" className="rounded-xl border-outline-variant" />
                <select name="status" defaultValue={filters.status ?? ''} className="rounded-xl border-outline-variant">
                    <option value="">Any status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
                <select name="approval" defaultValue={filters.approval ?? ''} className="rounded-xl border-outline-variant">
                    <option value="">Any approval</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </SearchForm>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Approval</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {products.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No products match this search.</td></tr>
                        ) : products.data.map((product) => (
                            <tr key={product.id}>
                                <td className="px-4 py-3 font-semibold">{product.title}</td>
                                <td className="px-4 py-3">{product.formatted_price}</td>
                                <td className="px-4 py-3">{product.stock}</td>
                                <td className="px-4 py-3">{product.status_label}</td>
                                <td className="px-4 py-3">{product.approval_label}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('vendor.products.edit', product.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('vendor.products.destroy', product.id)} confirmMessage="Delete this product?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={products.links} />
        </VendorLayout>
    );
}
