import { Head, Link, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ product, categories, statuses, approval_required }) {
    const editing = Boolean(product?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        category_id: product?.category_id ?? categories[0]?.id ?? '',
        title: product?.title ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        compare_at_price: product?.compare_at_price ?? '',
        stock: product?.stock ?? 0,
        sku: product?.sku ?? '',
        status: product?.status ?? 'draft',
        image_url: product?.image_url ?? '',
        image_urls: product?.image_urls ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(route('vendor.products.update', product.id));
        } else {
            post(route('vendor.products.store'));
        }
    };

    return (
        <VendorLayout title="Catalogue" heading={editing ? 'Edit product' : 'Add product'}>
            <Head title={editing ? 'Edit product' : 'Add product'} />
            <form onSubmit={submit} className="card-surface max-w-3xl space-y-4 p-6">
                {approval_required && (
                    <p className="rounded-xl bg-surface-container px-4 py-3 text-sm text-on-surface-variant">
                        Choosing “Submit for approval” keeps the product off the storefront until an admin publishes it.
                        {product?.approval_label ? ` Current approval: ${product.approval_label}.` : ''}
                    </p>
                )}
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Title</label>
                    <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.title} />
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
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">More image URLs</label>
                    <textarea value={data.image_urls} onChange={(e) => setData('image_urls', e.target.value)} rows={3} className="w-full rounded-xl border-outline-variant" placeholder="One image URL per line" />
                    <InputError message={errors.image_urls} />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save product</button>
                    <Link href={route('vendor.products.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </VendorLayout>
    );
}
