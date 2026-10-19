import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function Show({ order }) {
    const form = useForm({ reason: '', refund_amount: order.total_amount });

    return (
        <AppLayout header={<h2 className="font-display text-xl font-bold">{order.number}</h2>}>
            <Head title={order.number} />
            <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 lg:px-8">
                <div className="card-surface space-y-3 p-5 text-sm">
                    <div className="font-semibold">{order.status}</div>
                    <p>{order.shipping_address}</p>
                    <ul className="space-y-2">
                        {order.items.map((item) => (
                            <li key={item.title}>
                                <div className="flex justify-between"><span>{item.quantity} × {item.title}</span><span>{item.line_total}</span></div>
                                <div className="text-on-surface-variant">{item.fulfilment}{item.carrier ? ` · ${item.carrier}` : ''}{item.tracking_number ? ` · ${item.tracking_number}` : ''}</div>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between"><span>Items</span><span>{order.subtotal}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>{order.shipping_fee}</span></div>
                    <div className="flex justify-between font-display text-xl font-extrabold"><span>Total</span><span>{order.total}</span></div>
                </div>
                {order.returns.length > 0 && (
                    <div className="card-surface p-5 text-sm">
                        <div className="font-semibold">Returns</div>
                        {order.returns.map((item) => (
                            <p key={item.reason} className="mt-2">{item.status} · {item.amount} · {item.reason}</p>
                        ))}
                    </div>
                )}
                {order.can_return && (
                    <form className="card-surface space-y-3 p-5" onSubmit={(event) => { event.preventDefault(); form.post(route('account.orders.return', order.number)); }}>
                        <div className="font-semibold">Request a return</div>
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
