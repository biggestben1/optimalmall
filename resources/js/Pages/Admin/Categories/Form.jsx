import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ category, parents }) {
    const editing = Boolean(category?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        parent_id: category?.parent_id ?? '',
        name: category?.name ?? '',
        icon: category?.icon ?? '',
        description: category?.description ?? '',
        sort_order: category?.sort_order ?? 0,
        is_active: category?.is_active ?? true,
    });

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(route('admin.categories.update', category.id));
        } else {
            post(route('admin.categories.store'));
        }
    };

    return (
        <AdminLayout title="Catalogue" heading={editing ? 'Edit category' : 'New category'}>
            <Head title={editing ? 'Edit category' : 'New category'} />
            <form onSubmit={submit} className="card-surface max-w-xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Name</label>
                    <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.name} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Parent</label>
                    <select value={data.parent_id ?? ''} onChange={(e) => setData('parent_id', e.target.value)} className="w-full rounded-xl border-outline-variant">
                        <option value="">Top level</option>
                        {parents.map((parent) => (
                            <option key={parent.id} value={parent.id}>{parent.name}</option>
                        ))}
                    </select>
                    <InputError message={errors.parent_id} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Icon</label>
                        <input value={data.icon} onChange={(e) => setData('icon', e.target.value)} className="w-full rounded-xl border-outline-variant" placeholder="phone_iphone" />
                        <InputError message={errors.icon} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Sort order</label>
                        <input type="number" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.sort_order} />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Description</label>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.description} />
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save</button>
                    <Link href={route('admin.categories.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
