import { Head, useForm, usePage } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Help() {
    const { auth } = usePage().props;
    const form = useForm({
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        subject: '',
        message: '',
    });

    return (
        <StorefrontLayout>
            <Head title="Help" />
            <section className="mx-auto max-w-xl px-4 py-6 lg:px-10">
                <h1 className="font-display text-3xl font-extrabold">Help</h1>
                <p className="mt-2 text-sm text-on-surface-variant">Send a message to the mall. It opens a support ticket for the team.</p>
                <form className="card-surface mt-6 space-y-3 p-5" onSubmit={(event) => { event.preventDefault(); form.post(route('help.store')); }}>
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Name" required />
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} placeholder="Email" required />
                    <input className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} placeholder="Subject" required />
                    <textarea className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" rows="4" value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} placeholder="How can we help?" required />
                    {Object.values(form.errors).map((error) => <p key={error} className="text-sm text-red-700">{error}</p>)}
                    <button className="btn-accent" disabled={form.processing}>Send</button>
                </form>
            </section>
        </StorefrontLayout>
    );
}
