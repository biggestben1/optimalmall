import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

const statusTone = {
    Pending: 'bg-secondary-container text-on-secondary',
    Paid: 'bg-primary-container text-on-primary',
    Processing: 'bg-tertiary-fixed text-tertiary',
    Shipped: 'bg-primary text-on-primary',
    Delivered: 'bg-tertiary text-on-primary',
    Cancelled: 'bg-red-100 text-red-800',
};

export default function Show({ order }) {
    const form = useForm({ reason: '', refund_amount: order.total_amount });

    return (
        <AppLayout>
            <Head title={order.number} />
            <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary lg:p-8">
                    <Link href={route('account.orders.index')} className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">All orders</Link>
                    <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{order.number}</h1>
                    <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusTone[order.status] || 'bg-white/15 text-on-primary'}`}>{order.status}</span>
                </section>

                <section className="card-surface mt-6 p-5 text-sm lg:p-6">
                    <div className="text-xs font-bold uppercase tracking-wide text-secondary">Delivery</div>
                    <p className="mt-2 whitespace-pre-line font-semibold">{order.shipping_address}</p>
                    <ul className="mt-4 divide-y divide-surface-container">
                        {order.items.map((item) => (
                            <li key={item.title} className="py-3">
                                <div className="flex justify-between gap-3">
                                    <span className="font-semibold">{item.quantity} × {item.title}</span>
                                    <span>{item.line_total}</span>
                                </div>
                                <div className="text-on-surface-variant">{item.fulfilment}{item.carrier ? ` · ${item.carrier}` : ''}{item.tracking_number ? ` · ${item.tracking_number}` : ''}</div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 space-y-1 border-t border-surface-container pt-3">
                        <div className="flex justify-between"><span>Items</span><span>{order.subtotal}</span></div>
                        <div className="flex justify-between"><span>Delivery</span><span>{order.shipping_fee}</span></div>
                        <div className="flex justify-between font-display text-2xl font-extrabold text-primary"><span>Total</span><span>{order.total}</span></div>
                    </div>
                </section>

                {order.returns.length > 0 && (
                    <section className="card-surface mt-4 p-5 text-sm">
                        <h2 className="font-display text-xl font-bold">Returns</h2>
                        {order.returns.map((item) => (
                            <p key={item.reason} className="mt-2">{item.status} · {item.amount} · {item.reason}</p>
                        ))}
                    </section>
                )}

                {order.can_return && (
                    <form className="card-surface mt-4 space-y-3 p-5" onSubmit={(event) => { event.preventDefault(); form.post(route('account.orders.return', order.number)); }}>
                        <div className="text-xs font-bold uppercase tracking-wide text-secondary">After delivery</div>
                        <h2 className="font-display text-2xl font-bold">Request a return</h2>
                        <p className="text-sm text-on-surface-variant">This asks the mall to review a refund. It does not refund the order by itself.</p>
                        <input className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} placeholder="Reason" required />
                        <input className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" type="number" min="1" step="0.01" value={form.data.refund_amount} onChange={(event) => form.setData('refund_amount', event.target.value)} required />
                        {form.errors.reason && <p className="text-sm text-red-700">{form.errors.reason}</p>}
                        {form.errors.refund_amount && <p className="text-sm text-red-700">{form.errors.refund_amount}</p>}
                        <button className="btn-primary" disabled={form.processing}>Request return</button>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
