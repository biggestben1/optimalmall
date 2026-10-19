import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function Show({ order, statuses }) {
    const { data, setData, patch, processing } = useForm({ status: order.status });

    const submit = (event) => {
        event.preventDefault();
        patch(route('admin.orders.update', order.id));
    };

    return (
        <AdminLayout title="Sales" heading={order.number}>
            <Head title={order.number} />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-on-surface-variant">
                    {order.customer_name} · {order.customer_email} · {order.placed_at}
                </div>
                <Link href={route('admin.orders.index')} className="text-sm font-bold text-primary">Back to orders</Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="card-surface overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                            <tr>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3">Qty</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-semibold">{item.title}</td>
                                    <td className="px-4 py-3">{item.quantity}</td>
                                    <td className="px-4 py-3">{item.unit_price}</td>
                                    <td className="px-4 py-3">{item.line_total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="space-y-1 px-4 py-4 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{order.subtotal}</span></div>
                        <div className="flex justify-between"><span>Shipping</span><span>{order.shipping_fee}</span></div>
                        <div className="flex justify-between font-bold"><span>Total</span><span>{order.total}</span></div>
                    </div>
                </div>
                <form onSubmit={submit} className="card-surface h-fit space-y-4 p-5">
                    <label className="block text-xs font-bold uppercase">Status</label>
                    <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full rounded-xl border-outline-variant">
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn-primary w-full" disabled={processing}>Update order</button>
                </form>
            </div>
        </AdminLayout>
    );
}
