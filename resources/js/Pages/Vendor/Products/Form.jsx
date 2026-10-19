import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ product, categories, statuses, approval_required }) {
    const editing = Boolean(product?.id);
    const [primaryFile, setPrimaryFile] = useState(null);
    const [primaryPreview, setPrimaryPreview] = useState('');
    const [extraRows, setExtraRows] = useState([{ id: 1, file: null, preview: '' }]);
    const { data, setData, post, processing, errors, transform } = useForm({
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
        const extraFiles = extraRows.map((row) => row.file).filter(Boolean);
        transform((payload) => {
            const next = {
                ...payload,
                images: extraFiles,
                ...(editing ? { _method: 'put' } : {}),
            };

            if (primaryFile) {
                next.image = primaryFile;
            }

            return next;
        });
        post(editing ? route('vendor.products.update', product.id) : route('vendor.products.store'), {
            forceFormData: true,
        });
    };

    const choosePrimary = (event) => {
        const file = event.target.files?.[0] ?? null;
        setPrimaryFile(file);
        setPrimaryPreview(file ? URL.createObjectURL(file) : '');
    };

    const chooseExtra = (id, file) => {
        setExtraRows((rows) => rows.map((row) => (
            row.id === id
                ? { ...row, file, preview: file ? URL.createObjectURL(file) : '' }
                : row
        )));
    };

    const addExtra = () => {
        setExtraRows((rows) => [...rows, { id: Date.now(), file: null, preview: '' }]);
    };

    const removeExtra = (id) => {
        setExtraRows((rows) => (rows.length === 1 ? [{ id: Date.now(), file: null, preview: '' }] : rows.filter((row) => row.id !== id)));
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
                    <label className="mb-1 block text-xs font-bold uppercase">Main photo</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={choosePrimary} className="block w-full text-sm" />
                    <p className="mt-1 text-xs text-on-surface-variant">JPG, PNG, WEBP, or GIF up to 4 MB.</p>
                    <InputError message={errors.image} />
                    {(primaryPreview || product?.image_preview) && (
                        <img src={primaryPreview || product.image_preview} alt="" className="mt-3 h-24 w-24 rounded-xl object-cover" />
                    )}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Or paste a main image URL</label>
                    <input value={data.image_url} onChange={(e) => setData('image_url', e.target.value)} className="w-full rounded-xl border-outline-variant" placeholder="https://..." />
                    <InputError message={errors.image_url} />
                </div>
                <div className="space-y-3 rounded-xl border border-outline-variant p-4">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-xs font-bold uppercase">More images</label>
                        <button type="button" onClick={addExtra} className="text-sm font-bold text-primary">Add another image</button>
                    </div>
                    <p className="text-xs text-on-surface-variant">Upload extra photos, or paste more image URLs below. One URL per line.</p>
                    {extraRows.map((row, index) => (
                        <div key={row.id} className="flex flex-wrap items-center gap-3">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(event) => chooseExtra(row.id, event.target.files?.[0] ?? null)}
                                className="block min-w-0 flex-1 text-sm"
                                aria-label={`Extra image ${index + 1}`}
                            />
                            {row.preview && <img src={row.preview} alt="" className="h-16 w-16 rounded-lg object-cover" />}
                            <button type="button" onClick={() => removeExtra(row.id)} className="text-sm font-bold text-on-surface-variant">Remove</button>
                            <InputError message={errors[`images.${index}`]} />
                        </div>
                    ))}
                    <InputError message={errors.images} />
                    {(product?.image_previews ?? []).length > 1 && (
                        <div className="flex flex-wrap gap-2">
                            {product.image_previews.slice(1).map((src) => (
                                <img key={src} src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
                            ))}
                        </div>
                    )}
                    <textarea value={data.image_urls} onChange={(e) => setData('image_urls', e.target.value)} rows={3} className="w-full rounded-xl border-outline-variant" placeholder="More image URLs, one per line" />
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
