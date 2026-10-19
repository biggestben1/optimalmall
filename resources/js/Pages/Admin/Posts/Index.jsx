import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ posts }) {
    return (
        <AdminLayout title="Content" heading="Blog">
            <Head title="Blog" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Published posts appear at /blog.</p>
                <Link href={route('admin.posts.create')} className="btn-primary">Add post</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Published</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {posts.data.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-8 text-center text-on-surface-variant">No posts yet.</td></tr>
                        ) : posts.data.map((post) => (
                            <tr key={post.id}>
                                <td className="px-4 py-3 font-semibold">{post.title}</td>
                                <td className="px-4 py-3">{post.published_at ?? 'Draft'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.posts.edit', post.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.posts.destroy', post.id)} confirmMessage="Delete this post?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={posts.links} />
        </AdminLayout>
    );
}
