import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ page }) {
    const editing = Boolean(page?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        title: page?.title ?? '',
        slug: page?.slug ?? '',
        body: page?.body ?? '',
        seo_title: page?.seo_title ?? '',
        seo_description: page?.seo_description ?? '',
        is_published: Boolean(page?.is_published),
    });

    function submit(event) {
        event.preventDefault();
        if (editing) put(route('admin.pages.update', page.id));
        else post(route('admin.pages.store'));
    }

    return (
        <AdminLayout title="Content" heading={editing ? 'Edit page' : 'New page'}>
            <Head title={editing ? 'Edit page' : 'New page'} />
            <form onSubmit={submit} className="card-surface max-w-3xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Title</label>
                    <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.title} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Slug</label>
                    <input value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="w-full rounded-xl border-outline-variant" placeholder="about" />
                    <InputError message={errors.slug} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Body</label>
                    <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} rows={8} className="w-full rounded-xl border-outline-variant" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">SEO title</label>
                        <input value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">SEO description</label>
                        <input value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                    Published
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save page</button>
                    <Link href={route('admin.pages.index')} className="font-bold text-primary">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
