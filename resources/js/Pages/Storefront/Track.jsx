import { Head, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Track() {
    const form = useForm({ number: '', email: '' });

    return (
        <StorefrontLayout>
            <Head title="Track an order" />
            <section className="mx-auto max-w-xl px-4 py-6 lg:px-10">
                <h1 className="font-display text-3xl font-extrabold">Track an order</h1>
                <p className="mt-2 text-sm text-on-surface-variant">Use the order number and the email used at checkout.</p>
                <form className="card-surface mt-6 space-y-3 p-5" onSubmit={(event) => { event.preventDefault(); form.post(route('track.store')); }}>
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" value={form.data.number} onChange={(event) => form.setData('number', event.target.value)} placeholder="Order number" required />
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="Email" required />
                    {form.errors.number && <p className="text-sm text-red-700">{form.errors.number}</p>}
                    <button className="btn-accent" disabled={form.processing}>Show order</button>
                </form>
            </section>
        </StorefrontLayout>
    );
}
