import { Head, Link, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Show({ order }) {
    const item = order.items[0] ?? {};
    const { data, setData, patch, processing, errors } = useForm({
        fulfilment_status: item.fulfilment ?? 'pending',
        carrier: item.carrier ?? '',
        tracking_number: item.tracking_number ?? '',
    });

    return (
        <VendorLayout title="Fulfilment" heading={order.number}>
            <Head title={order.number} />
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                <section className="card-surface overflow-x-auto">
                    <div className="border-b border-surface-container px-4 py-3">
                        <h2 className="font-display text-lg font-bold">Your items</h2>
                    </div>
                    <table className="min-w-full text-left text-sm">
                        <tbody className="divide-y divide-surface-container">
                            {order.items.map((line) => (
                                <tr key={line.id}>
                                    <td className="px-4 py-3 font-semibold">{line.title}</td>
                                    <td className="px-4 py-3">× {line.quantity}</td>
                                    <td className="px-4 py-3">{line.fulfilment_label}</td>
                                    <td className="px-4 py-3 text-right">{line.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <aside className="card-surface space-y-2 p-5 text-sm">
                    <div className="text-xs font-bold uppercase text-on-surface-variant">Customer</div>
                    <div className="font-semibold">{order.customer_name}</div>
                    <div>{order.customer_email}</div>
                    <div className="text-on-surface-variant">{order.shipping_address || 'No shipping address yet.'}</div>
                    <div className="pt-2">Payment: {order.payment_status}</div>
                    <div>Your total: {order.total}</div>
                </aside>
            </div>
            <form
                onSubmit={(event) => { event.preventDefault(); patch(route('vendor.orders.update', order.id)); }}
                className="card-surface mt-4 max-w-3xl space-y-4 p-6"
            >
                <h2 className="font-display text-lg font-bold">Shipping and delivery</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Fulfilment</label>
                        <select value={data.fulfilment_status} onChange={(e) => setData('fulfilment_status', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            {order.statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                        </select>
                        <InputError message={errors.fulfilment_status} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Carrier</label>
                        <input value={data.carrier} onChange={(e) => setData('carrier', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.carrier} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Tracking number</label>
                        <input value={data.tracking_number} onChange={(e) => setData('tracking_number', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.tracking_number} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Update tracking</button>
                    <Link href={route('vendor.orders.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Back</Link>
                </div>
            </form>
        </VendorLayout>
    );
}
