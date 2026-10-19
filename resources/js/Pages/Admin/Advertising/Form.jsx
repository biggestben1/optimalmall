import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ advertisement, placements }) {
    const editing = Boolean(advertisement?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        title: advertisement?.title ?? '',
        placement: advertisement?.placement ?? 'homepage',
        image_path: advertisement?.image_path ?? '',
        link_url: advertisement?.link_url ?? '',
        budget: advertisement?.budget ?? 0,
        starts_at: advertisement?.starts_at ?? '',
        ends_at: advertisement?.ends_at ?? '',
        is_active: advertisement?.is_active ?? true,
    });

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(route('admin.advertisements.update', advertisement.id));
        } else {
            post(route('admin.advertisements.store'));
        }
    };

    return (
        <AdminLayout title="Promotions" heading={editing ? 'Edit advertisement' : 'New advertisement'}>
            <Head title={editing ? 'Edit advertisement' : 'New advertisement'} />
            <form onSubmit={submit} className="card-surface max-w-xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Title</label>
                    <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.title} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Placement</label>
                    <select value={data.placement} onChange={(e) => setData('placement', e.target.value)} className="w-full rounded-xl border-outline-variant">
                        {placements.map((placement) => <option key={placement.value} value={placement.value}>{placement.label}</option>)}
                    </select>
                    <InputError message={errors.placement} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Image URL</label>
                    <input value={data.image_path} onChange={(e) => setData('image_path', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.image_path} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Link URL</label>
                    <input value={data.link_url} onChange={(e) => setData('link_url', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.link_url} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Budget</label>
                        <input type="number" step="0.01" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.budget} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Starts</label>
                        <input type="date" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.starts_at} />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Ends</label>
                    <input type="date" value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.ends_at} />
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save</button>
                    <Link href={route('admin.advertisements.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
