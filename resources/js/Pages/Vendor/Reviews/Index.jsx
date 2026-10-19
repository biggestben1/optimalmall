import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import Pagination from '../../../Components/Admin/Pagination';
import SearchForm from '../../../Components/Vendor/SearchForm';
import InputError from '../../../Components/Admin/InputError';

function ReplyForm({ review }) {
    const { data, setData, post, processing, errors } = useForm({ reply: review.reply ?? '' });

    return (
        <form onSubmit={(event) => { event.preventDefault(); post(route('vendor.reviews.reply', review.id)); }} className="mt-2 flex gap-2">
            <input value={data.reply} onChange={(e) => setData('reply', e.target.value)} placeholder="Reply to this review" className="w-full rounded-xl border-outline-variant" />
            <button type="submit" className="font-bold text-primary" disabled={processing}>Reply</button>
            <InputError message={errors.reply} />
        </form>
    );
}

export default function Index({ reviews, filters = {} }) {
    return (
        <VendorLayout title="Customers" heading="Reviews">
            <Head title="Reviews" />
            <SearchForm action={route('vendor.reviews.index')} values={filters}>
                <input name="q" defaultValue={filters.q ?? ''} placeholder="Product, reviewer, or review" className="rounded-xl border-outline-variant lg:col-span-2" />
            </SearchForm>
            <div className="space-y-3">
                {reviews.data.length === 0 ? (
                    <div className="card-surface px-4 py-8 text-center text-sm text-on-surface-variant">No reviews for your products yet.</div>
                ) : reviews.data.map((review) => (
                    <article key={review.id} className="card-surface p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="font-semibold">{review.product}</h2>
                            <div className="text-sm text-on-surface-variant">{review.rating}/5 · {review.status} · {review.created_at}</div>
                        </div>
                        <p className="mt-2 text-sm">{review.body}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{review.author}</p>
                        <ReplyForm review={review} />
                    </article>
                ))}
            </div>
            <Pagination links={reviews.links} />
        </VendorLayout>
    );
}
