import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FilterBar from '../../../Components/Admin/FilterBar';
import Pagination from '../../../Components/Admin/Pagination';

function StockForm({ product }) {
    const [stock, setStock] = useState(product.stock);

    return (
        <form
            className="flex items-center justify-end gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                router.patch(route('admin.inventory.update', product.id), { stock });
            }}
        >
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-24 rounded-lg border-outline-variant text-sm" />
            <button type="submit" className="font-bold text-primary">Save</button>
        </form>
    );
}

export default function Index({ products, filters, threshold }) {
    return (
        <AdminLayout title="Sales" heading="Inventory">
            <Head title="Inventory" />
            <p className="mb-4 text-sm text-on-surface-variant">Stock for every seller. Low means {threshold} or fewer units.</p>
            <FilterBar action={route('admin.inventory.index')} filters={filters} placeholder="Product, SKU, or category">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="low" value="1" defaultChecked={filters.low} />
                    Low stock only
                </label>
            </FilterBar>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Seller</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {products.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No products match.</td></tr>
                        ) : products.data.map((product) => (
                            <tr key={product.id}>
                                <td className="px-4 py-3 font-semibold">
                                    {product.title}
                                    {product.low && <div className="text-xs font-bold text-secondary">Low stock</div>}
                                </td>
                                <td className="px-4 py-3">{product.vendor}</td>
                                <td className="px-4 py-3">{product.sku || '—'}</td>
                                <td className="px-4 py-3"><StockForm product={product} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={products.links} />
        </AdminLayout>
    );
}
