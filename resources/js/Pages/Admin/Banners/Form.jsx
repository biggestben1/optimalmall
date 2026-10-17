import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ banner }) {
    const editing = Boolean(banner?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        title: banner?.title ?? '',
        subtitle: banner?.subtitle ?? '',
        image_path: banner?.image_path ?? '',
        link_url: banner?.link_url ?? '',
        cta_label: banner?.cta_label ?? '',
        sort_order: banner?.sort_order ?? 0,
        is_active: banner?.is_active ?? true,
    });

    const submit = (event) => {
        event.preventDefault();
        if (editing) {
            put(route('admin.banners.update', banner.id));
        } else {
            post(route('admin.banners.store'));
        }
    };

    return (
        <AdminLayout title="Content" heading={editing ? 'Edit banner' : 'New banner'}>
            <Head title={editing ? 'Edit banner' : 'New banner'} />
            <form onSubmit={submit} className="card-surface max-w-xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Title</label>
                    <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.title} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Subtitle</label>
                    <input value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.subtitle} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Image URL</label>
                    <input value={data.image_path} onChange={(e) => setData('image_path', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.image_path} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Link URL</label>
                        <input value={data.link_url} onChange={(e) => setData('link_url', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.link_url} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">CTA label</label>
                        <input value={data.cta_label} onChange={(e) => setData('cta_label', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.cta_label} />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Sort order</label>
                    <input type="number" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.sort_order} />
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save</button>
                    <Link href={route('admin.banners.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
