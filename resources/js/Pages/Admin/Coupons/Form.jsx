import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ coupon, types }) {
    const editing = Boolean(coupon?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        code: coupon?.code ?? '',
        type: coupon?.type ?? 'percent',
        value: coupon?.value ?? 10,
        min_order: coupon?.min_order ?? 0,
        usage_limit: coupon?.usage_limit ?? '',
        starts_at: coupon?.starts_at ?? '',
        ends_at: coupon?.ends_at ?? '',
        is_active: coupon?.is_active ?? true,
    });

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(route('admin.coupons.update', coupon.id));
        } else {
            post(route('admin.coupons.store'));
        }
    };

    return (
        <AdminLayout title="Promotions" heading={editing ? 'Edit coupon' : 'New coupon'}>
            <Head title={editing ? 'Edit coupon' : 'New coupon'} />
            <form onSubmit={submit} className="card-surface max-w-xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Code</label>
                    <input value={data.code} onChange={(e) => setData('code', e.target.value)} className="w-full rounded-xl border-outline-variant uppercase" required />
                    <InputError message={errors.code} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Type</label>
                        <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                        </select>
                        <InputError message={errors.type} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Value</label>
                        <input type="number" step="0.01" value={data.value} onChange={(e) => setData('value', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.value} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Minimum order</label>
                        <input type="number" step="0.01" value={data.min_order} onChange={(e) => setData('min_order', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.min_order} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Usage limit</label>
                        <input type="number" value={data.usage_limit} onChange={(e) => setData('usage_limit', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.usage_limit} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Starts</label>
                        <input type="date" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.starts_at} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Ends</label>
                        <input type="date" value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.ends_at} />
                    </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save</button>
                    <Link href={route('admin.coupons.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
