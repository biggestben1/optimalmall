import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function OrderPlaced({ order }) {
    return (
        <StorefrontLayout>
            <Head title={`Order ${order.number}`} />
            <section className="mx-auto max-w-3xl px-4 py-6 lg:px-10">
                <h1 className="font-display text-3xl font-extrabold">Order {order.number}</h1>
                <p className="mt-2 text-sm text-on-surface-variant">
                    {order.paid
                        ? 'Paid from your wallet. The sellers can prepare it for delivery.'
                        : 'Placed for pay on delivery. It is not marked paid until the payment is collected.'}
                </p>
                <div className="card-surface mt-6 space-y-3 p-5 text-sm">
                    <div><span className="text-on-surface-variant">Status</span><div className="font-semibold">{order.status}</div></div>
                    <div><span className="text-on-surface-variant">Deliver to</span><div className="font-semibold">{order.customer_name}</div><div>{order.shipping_address}</div><div>{order.customer_email}</div></div>
                    <ul className="space-y-2 border-t border-surface-container pt-3">
                        {order.items.map((item) => (
                            <li key={item.title} className="flex justify-between gap-3">
                                <span>
                                    {item.quantity} × {item.title}
                                    {item.fulfilment && <span className="block text-on-surface-variant">{item.fulfilment}{item.carrier ? ` · ${item.carrier}` : ''}{item.tracking_number ? ` · ${item.tracking_number}` : ''}</span>}
                                </span>
                                <span>{item.line_total}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-between"><span>Items</span><span>{order.subtotal}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span>{order.shipping_fee}</span></div>
                    <div className="flex justify-between font-display text-xl font-extrabold text-primary"><span>Total</span><span>{order.total}</span></div>
                </div>
                <Link href={route('products.index')} className="btn-primary mt-6 inline-flex">Continue shopping</Link>
            </section>
        </StorefrontLayout>
    );
}
