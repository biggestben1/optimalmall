import { Head, Link, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Show({ ticket }) {
    const { data, setData, post, processing, errors } = useForm({ body: '' });

    return (
        <VendorLayout title="Support" heading={ticket.subject}>
            <Head title={ticket.subject} />
            <p className="mb-4 text-sm text-on-surface-variant">{ticket.status_label}{ticket.customer_name ? ` · ${ticket.customer_name}` : ''}</p>
            <div className="max-w-3xl space-y-3">
                {ticket.messages.map((message) => (
                    <article key={message.id} className={`card-surface p-4 ${message.mine ? '' : 'bg-surface-container'}`}>
                        <div className="text-xs font-bold uppercase text-on-surface-variant">{message.author} · {message.created_at}</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{message.body}</p>
                    </article>
                ))}
                <form onSubmit={(event) => { event.preventDefault(); post(route('vendor.tickets.reply', ticket.id)); }} className="card-surface space-y-3 p-4">
                    <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} rows={4} className="w-full rounded-xl border-outline-variant" placeholder="Write a reply" />
                    <InputError message={errors.body} />
                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={processing}>Reply</button>
                        <Link href={route('vendor.tickets.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Back</Link>
                    </div>
                </form>
            </div>
        </VendorLayout>
    );
}
