import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ vendor, statuses, hasLogin = false }) {
    const editing = Boolean(vendor?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        name: vendor?.name ?? '',
        description: vendor?.description ?? '',
        status: vendor?.status ?? 'pending',
        city: vendor?.city ?? '',
        state: vendor?.state ?? '',
        phone: vendor?.phone ?? '',
        email: vendor?.email ?? '',
        password: '',
    });

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(route('admin.vendors.update', vendor.id));
        } else {
            post(route('admin.vendors.store'));
        }
    };

    return (
        <AdminLayout title="Sellers" heading={editing ? 'Edit vendor' : 'New vendor'}>
            <Head title={editing ? 'Edit vendor' : 'New vendor'} />
            <form onSubmit={submit} className="card-surface max-w-xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Name</label>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.name} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Description</label>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.description} />
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
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">City</label>
                        <input value={data.city} onChange={(e) => setData('city', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.city} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">State</label>
                        <input value={data.state} onChange={(e) => setData('state', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.state} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Phone</label>
                        <input value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.phone} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Login email</label>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.email} />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">{hasLogin ? 'New password' : 'Password'}</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full rounded-xl border-outline-variant" required={!editing || !hasLogin} />
                    <p className="mt-1 text-xs text-on-surface-variant">
                        {hasLogin ? 'Leave blank to keep the current password. The vendor uses this email to sign in, add products, and view sales.' : 'The vendor signs in with this email and password to add products and view sales.'}
                    </p>
                    <InputError message={errors.password} />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save</button>
                    <Link href={route('admin.vendors.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
