import { useForm } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Funding({ requests }) {
    return (
        <AccountantLayout title="Funding receipts" heading="Funding receipts">
            <p className="mb-4 max-w-2xl text-sm text-on-surface-variant">Approve a receipt only after the transfer is in the mall account. Approval credits the customer wallet. Rejection does not.</p>
            <div className="space-y-3">
                {requests.data.map((item) => (
                    <article key={item.id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
                        <div>
                            <p className="font-display font-bold">{item.customer}</p>
                            <p className="text-sm text-on-surface-variant">{item.email}</p>
                            <p className="mt-1 text-sm">{item.created_at} · {item.status}</p>
                            {item.note && <p className="text-sm text-secondary">{item.note}</p>}
                        </div>
                        <div className="text-right">
                            <p className="font-display text-2xl font-extrabold text-primary">{item.amount}</p>
                            <a className="text-sm font-bold text-primary" href={route('accountant.funding.proof', item.id)} target="_blank" rel="noreferrer">Open receipt</a>
                            {item.pending && <Review item={item} />}
                        </div>
                    </article>
                ))}
                {requests.data.length === 0 && <p className="text-sm text-on-surface-variant">No funding receipts yet.</p>}
            </div>
            <div className="mt-4">
                <Pagination links={requests.links} />
            </div>
        </AccountantLayout>
    );
}

function Review({ item }) {
    const approve = useForm({});
    const reject = useForm({ review_note: '' });

    return (
        <div className="mt-3 space-y-2 text-left">
            <button type="button" className="btn-primary" disabled={approve.processing} onClick={() => approve.post(route('accountant.funding.approve', item.id))}>Approve and credit</button>
            <form className="flex flex-wrap justify-end gap-2" onSubmit={(event) => { event.preventDefault(); reject.post(route('accountant.funding.reject', item.id)); }}>
                <input className="rounded-lg border px-2 py-1 text-xs" placeholder="Reason if rejecting" value={reject.data.review_note} onChange={(event) => reject.setData('review_note', event.target.value)} />
                <button className="text-sm font-bold text-secondary" disabled={reject.processing}>Reject</button>
            </form>
        </div>
    );
}
