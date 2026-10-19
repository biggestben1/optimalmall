import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Post({ post }) {
    return (
        <StorefrontLayout>
            <Head title={post.seo_title}>
                {post.seo_description ? <meta name="description" content={post.seo_description} head-key="description" /> : null}
            </Head>
            <article className="mx-auto max-w-3xl px-4 py-10">
                <Link href={route('blog.index')} className="text-sm font-bold text-primary">Blog</Link>
                <h1 className="mt-3 font-display text-3xl font-bold">{post.title}</h1>
                <div className="mt-2 text-xs font-bold uppercase text-on-surface-variant">{post.published_at}</div>
                <div className="mt-6 whitespace-pre-wrap text-sm leading-7">{post.body}</div>
            </article>
        </StorefrontLayout>
    );
}
