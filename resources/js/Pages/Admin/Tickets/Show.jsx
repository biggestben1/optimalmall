import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Show({ ticket, statuses }) {
    const { data, setData, patch, processing } = useForm({
        status: ticket.status,
        body: '',
    });

    return (
        <AdminLayout title="Support" heading={ticket.subject}>
            <Head title={ticket.subject} />
            <p className="mb-4 text-sm text-on-surface-variant">{ticket.vendor || 'Marketplace'} · {ticket.customer || 'No customer name'} · {ticket.email || ''}</p>
            <div className="card-surface space-y-4 p-5">
                {ticket.messages.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">No replies yet.</p>
                ) : ticket.messages.map((message) => (
                    <div key={message.id} className="rounded-xl bg-surface-container-low p-4">
                        <div className="text-xs font-bold uppercase text-on-surface-variant">{message.author} · {message.at}</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p>
                    </div>
                ))}
            </div>
            <form
                className="card-surface mt-4 space-y-3 p-5"
                onSubmit={(event) => {
                    event.preventDefault();
                    patch(route('admin.tickets.update', ticket.id));
                }}
            >
                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="rounded-xl border-outline-variant">
                    {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                </select>
                <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} rows={4} placeholder="Reply to the seller" className="w-full rounded-xl border-outline-variant" />
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save</button>
                    <Link href={route('admin.tickets.index')} className="font-bold text-primary">Back</Link>
                </div>
            </form>
        </AdminLayout>
    );
}
