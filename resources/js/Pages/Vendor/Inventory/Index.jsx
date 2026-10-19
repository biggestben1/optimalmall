import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import VendorLayout from '../../../Layouts/VendorLayout';
import Pagination from '../../../Components/Admin/Pagination';
import SearchForm from '../../../Components/Vendor/SearchForm';

function StockField({ product }) {
    const [stock, setStock] = useState(product.stock);

    return (
        <form
            className="flex justify-end gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                router.patch(route('vendor.inventory.update', product.id), { stock });
            }}
        >
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-24 rounded-xl border-outline-variant" />
            <button type="submit" className="font-bold text-primary">Save</button>
        </form>
    );
}

export default function Index({ products, filters = {} }) {
    return (
        <VendorLayout title="Stock" heading="Inventory">
            <Head title="Inventory" />
            <p className="mb-4 text-sm text-on-surface-variant">Stock belongs to your products. Rows at 5 or below are low.</p>
            <SearchForm action={route('vendor.inventory.index')} values={filters}>
                <input name="q" defaultValue={filters.q ?? ''} placeholder="Title, SKU, or category" className="rounded-xl border-outline-variant" />
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" name="low" value="1" defaultChecked={filters.low} />
                    Low stock only
                </label>
            </SearchForm>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Level</th>
                            <th className="px-4 py-3 text-right">Adjust</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {products.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No stock records match this search.</td></tr>
                        ) : products.data.map((product) => (
                            <tr key={product.id} className={product.low ? 'bg-secondary-container/10' : ''}>
                                <td className="px-4 py-3 font-semibold">{product.title}</td>
                                <td className="px-4 py-3">{product.sku || '—'}</td>
                                <td className="px-4 py-3">{product.low ? 'Low' : 'OK'}</td>
                                <td className="px-4 py-3"><StockField product={product} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={products.links} />
        </VendorLayout>
    );
}
