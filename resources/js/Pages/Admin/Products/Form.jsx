import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ product, vendors, categories, brands = [], statuses }) {
    const editing = Boolean(product?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        vendor_id: product?.vendor_id ?? vendors[0]?.id ?? '',
        category_id: product?.category_id ?? categories[0]?.id ?? '',
        brand_id: product?.brand_id ?? '',
        title: product?.title ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        compare_at_price: product?.compare_at_price ?? '',
        stock: product?.stock ?? 0,
        sku: product?.sku ?? '',
        status: product?.status ?? 'draft',
        image_url: product?.image_url ?? '',
        is_featured: Boolean(product?.is_featured),
        is_trending: Boolean(product?.is_trending),
        is_best_seller: Boolean(product?.is_best_seller),
    });

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(route('admin.products.update', product.id));
        } else {
            post(route('admin.products.store'));
        }
    };

    return (
        <AdminLayout title="Catalogue" heading={editing ? 'Edit product' : 'New product'}>
            <Head title={editing ? 'Edit product' : 'New product'} />
            <form onSubmit={submit} className="card-surface max-w-3xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Title</label>
                    <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.title} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Vendor</label>
                        <select value={data.vendor_id} onChange={(e) => setData('vendor_id', e.target.value)} className="w-full rounded-xl border-outline-variant" required>
                            {vendors.map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.vendor_id} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Category</label>
                        <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className="w-full rounded-xl border-outline-variant" required>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.category_id} />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Brand</label>
                    <select value={data.brand_id} onChange={(e) => setData('brand_id', e.target.value)} className="w-full rounded-xl border-outline-variant">
                        <option value="">No brand</option>
                        {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                    <InputError message={errors.brand_id} />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Description</label>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.description} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Price (NGN)</label>
                        <input type="number" step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.price} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Compare at</label>
                        <input type="number" step="0.01" value={data.compare_at_price} onChange={(e) => setData('compare_at_price', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.compare_at_price} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Stock</label>
                        <input type="number" value={data.stock} onChange={(e) => setData('stock', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.stock} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">SKU</label>
                        <input value={data.sku} onChange={(e) => setData('sku', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.sku} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Status</label>
                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Primary image URL</label>
                    <input value={data.image_url} onChange={(e) => setData('image_url', e.target.value)} className="w-full rounded-xl border-outline-variant" placeholder="https://..." />
                    <InputError message={errors.image_url} />
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} />
                        Featured
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={data.is_trending} onChange={(e) => setData('is_trending', e.target.checked)} />
                        Trending
                    </label>
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={data.is_best_seller} onChange={(e) => setData('is_best_seller', e.target.checked)} />
                        Best seller
                    </label>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary" disabled={processing}>Save product</button>
                    <Link href={route('admin.products.index')} className="rounded-xl px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
