import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import FilterBar from '../../../Components/Admin/FilterBar';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ products, filters }) {
    return (
        <AdminLayout title="Catalogue" heading="Products">
            <Head title="Products" />
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-on-surface-variant">Listings across every seller. Featured products appear on the storefront home page.</p>
                <Link href={route('admin.products.create')} className="btn-primary">Add product</Link>
            </div>
            <FilterBar action={route('admin.products.index')} filters={filters} placeholder="Title, SKU, seller, brand, or category">
                <select name="approval" defaultValue={filters.approval ?? ''} className="rounded-xl border-outline-variant text-sm">
                    <option value="">Any approval</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </FilterBar>

            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Vendor</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Approval</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {products.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">No products yet.</td>
                            </tr>
                        ) : (
                            products.data.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-4 py-3 font-semibold">
                                        {product.title}
                                        {product.brand_name && <div className="text-xs font-normal text-on-surface-variant">{product.brand_name}</div>}
                                    </td>
                                    <td className="px-4 py-3">{product.vendor_name}</td>
                                    <td className="px-4 py-3">{product.formatted_price}</td>
                                    <td className="px-4 py-3">{product.stock}</td>
                                    <td className="px-4 py-3">{product.status_label}</td>
                                    <td className="px-4 py-3">
                                        {product.approval === 'pending' ? (
                                            <span className="space-x-2">
                                                <button type="button" className="font-bold text-primary" onClick={() => { if (window.confirm('Publish this product?')) router.post(route('admin.products.approval', product.id), { decision: 'approve' }); }}>Approve</button>
                                                <button type="button" className="font-bold text-secondary" onClick={() => { if (window.confirm('Reject this product?')) router.post(route('admin.products.approval', product.id), { decision: 'reject' }); }}>Reject</button>
                                            </span>
                                        ) : product.approval_label}
                                    </td>
                                    <td className="space-x-3 px-4 py-3 text-right">
                                        <button type="button" className="font-bold text-primary" onClick={() => router.patch(route('admin.products.feature', product.id))}>
                                            {product.is_featured ? 'Unfeature' : 'Feature'}
                                        </button>
                                        <Link href={route('admin.products.edit', product.id)} className="font-bold text-primary">Edit</Link>
                                        <DeleteButton href={route('admin.products.destroy', product.id)} confirmMessage="Delete this product?" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={products.links} />
        </AdminLayout>
    );
}
