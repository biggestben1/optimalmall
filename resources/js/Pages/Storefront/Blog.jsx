import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Blog({ posts }) {
    return (
        <StorefrontLayout>
            <Head title="Blog" />
            <div className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="font-display text-3xl font-bold">Blog</h1>
                <div className="mt-6 space-y-4">
                    {posts.data.length === 0 ? (
                        <p className="text-sm text-on-surface-variant">No posts yet.</p>
                    ) : posts.data.map((post) => (
                        <Link key={post.slug} href={route('blog.show', post.slug)} className="card-surface block p-5">
                            <div className="text-xs font-bold uppercase text-on-surface-variant">{post.published_at}</div>
                            <h2 className="mt-1 font-display text-xl font-bold">{post.title}</h2>
                            {post.excerpt && <p className="mt-2 text-sm text-on-surface-variant">{post.excerpt}</p>}
                        </Link>
                    ))}
                </div>
                <Pagination links={posts.links} />
            </div>
        </StorefrontLayout>
    );
}
