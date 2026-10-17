import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ products }) {
    return (
        <AdminLayout title="Catalogue" heading="Products">
            <Head title="Products" />
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-on-surface-variant">Catalogue products shown on the storefront.</p>
                <Link href={route('admin.products.create')} className="btn-primary">Add product</Link>
            </div>

            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Vendor</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {products.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No products yet.</td>
                            </tr>
                        ) : (
                            products.data.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-4 py-3 font-semibold">{product.title}</td>
                                    <td className="px-4 py-3">{product.vendor_name}</td>
                                    <td className="px-4 py-3">{product.formatted_price}</td>
                                    <td className="px-4 py-3">{product.stock}</td>
                                    <td className="px-4 py-3">{product.status_label}</td>
                                    <td className="space-x-3 px-4 py-3 text-right">
                                        <Link href={route('admin.products.edit', product.id)} className="font-bold text-primary">Edit</Link>
                                        <DeleteButton
                                            href={route('admin.products.destroy', product.id)}
                                            confirmMessage="Delete this product?"
                                        />
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
