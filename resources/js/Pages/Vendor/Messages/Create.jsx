import { Head, Link, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        body: '',
        customer_name: '',
        customer_email: '',
    });

    return (
        <VendorLayout title="Support" heading="New message">
            <Head title="New message" />
            <form onSubmit={(event) => { event.preventDefault(); post(route('vendor.tickets.store')); }} className="card-surface max-w-3xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Subject</label>
                    <input value={data.subject} onChange={(e) => setData('subject', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.subject} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Customer name</label>
                        <input value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Customer email</label>
                        <input value={data.customer_email} onChange={(e) => setData('customer_email', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.customer_email} />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Message</label>
                    <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} rows={5} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.body} />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Send</button>
                    <Link href={route('vendor.tickets.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </VendorLayout>
    );
}
