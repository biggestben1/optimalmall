import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

function StatusForm({ review, statuses }) {
    const { data, setData, patch, processing } = useForm({ status: review.status });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                patch(route('admin.reviews.update', review.id));
            }}
            className="flex items-center justify-end gap-2"
        >
            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="rounded-lg border-outline-variant text-sm">
                {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
            <button type="submit" className="font-bold text-primary" disabled={processing}>Save</button>
            <DeleteButton href={route('admin.reviews.destroy', review.id)} confirmMessage="Delete this review?" />
        </form>
    );
}

export default function Index({ reviews, statuses }) {
    return (
        <AdminLayout title="Catalogue" heading="Reviews">
            <Head title="Reviews" />
            <p className="mb-4 text-sm text-on-surface-variant">Approve or hide product reviews.</p>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Author</th>
                            <th className="px-4 py-3">Rating</th>
                            <th className="px-4 py-3">Review</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {reviews.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No reviews yet.</td></tr>
                        ) : reviews.data.map((review) => (
                            <tr key={review.id}>
                                <td className="px-4 py-3 font-semibold">{review.product}</td>
                                <td className="px-4 py-3">{review.author_name}</td>
                                <td className="px-4 py-3">{review.rating}/5</td>
                                <td className="max-w-xs px-4 py-3">{review.body}</td>
                                <td className="px-4 py-3">
                                    <StatusForm review={review} statuses={statuses} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={reviews.links} />
        </AdminLayout>
    );
}
