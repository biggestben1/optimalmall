import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Form({ post }) {
    const editing = Boolean(post?.id);
    const { data, setData, post: submitPost, put, processing, errors } = useForm({
        title: post?.title ?? '',
        slug: post?.slug ?? '',
        excerpt: post?.excerpt ?? '',
        body: post?.body ?? '',
        seo_title: post?.seo_title ?? '',
        seo_description: post?.seo_description ?? '',
        is_published: Boolean(post?.is_published),
    });

    function submit(event) {
        event.preventDefault();
        if (editing) put(route('admin.posts.update', post.id));
        else submitPost(route('admin.posts.store'));
    }

    return (
        <AdminLayout title="Content" heading={editing ? 'Edit post' : 'New post'}>
            <Head title={editing ? 'Edit post' : 'New post'} />
            <form onSubmit={submit} className="card-surface max-w-3xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Title</label>
                    <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.title} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Excerpt</label>
                    <textarea value={data.excerpt} onChange={(e) => setData('excerpt', e.target.value)} rows={2} className="w-full rounded-xl border-outline-variant" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Body</label>
                    <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} rows={8} className="w-full rounded-xl border-outline-variant" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <input value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} placeholder="SEO title" className="rounded-xl border-outline-variant" />
                    <input value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} placeholder="SEO description" className="rounded-xl border-outline-variant" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                    Published
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save post</button>
                    <Link href={route('admin.posts.index')} className="font-bold text-primary">Cancel</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
