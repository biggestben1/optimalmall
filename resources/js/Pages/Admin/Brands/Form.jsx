import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ brand }) {
    const editing = Boolean(brand?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        name: brand?.name ?? '',
        description: brand?.description ?? '',
        is_active: Boolean(brand?.is_active ?? true),
    });

    function submit(event) {
        event.preventDefault();
        if (editing) put(route('admin.brands.update', brand.id));
        else post(route('admin.brands.store'));
    }

    return (
        <AdminLayout title="Catalogue" heading={editing ? 'Edit brand' : 'New brand'}>
            <Head title={editing ? 'Edit brand' : 'New brand'} />
            <form onSubmit={submit} className="card-surface max-w-xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Name</label>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.name} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Description</label>
                    <textarea value={data.description ?? ''} onChange={(e) => setData('description', e.target.value)} rows={4} className="w-full rounded-xl border-outline-variant" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save brand</button>
                    <Link href={route('admin.brands.index')} className="font-bold text-primary">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
