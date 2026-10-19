import { Head, Link, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function CouponForm({ coupon, types }) {
    const editing = Boolean(coupon?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        code: coupon.code ?? '',
        type: coupon.type ?? 'percent',
        value: coupon.value ?? '',
        min_order: coupon.min_order ?? '',
        usage_limit: coupon.usage_limit ?? '',
        starts_at: coupon.starts_at ?? '',
        ends_at: coupon.ends_at ?? '',
        is_active: coupon.is_active ?? true,
    });

    return (
        <VendorLayout title="Growth" heading={editing ? 'Edit discount' : 'Add discount'}>
            <Head title="Discount" />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (editing) {
                        put(route('vendor.promotions.coupons.update', coupon.id));
                    } else {
                        post(route('vendor.promotions.coupons.store'));
                    }
                }}
                className="card-surface max-w-3xl space-y-4 p-6"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Code</label>
                        <input value={data.code} onChange={(e) => setData('code', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.code} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Type</label>
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Value</label>
                        <input type="number" step="0.01" value={data.value} onChange={(e) => setData('value', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.value} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Minimum order</label>
                        <input type="number" step="0.01" value={data.min_order} onChange={(e) => setData('min_order', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save discount</button>
                    <Link href={route('vendor.promotions.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </VendorLayout>
    );
}
