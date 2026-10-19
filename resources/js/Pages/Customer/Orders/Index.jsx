import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ orders }) {
    return (
        <AppLayout header={<h2 className="font-display text-xl font-bold">My orders</h2>}>
            <Head title="My orders" />
            <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
                {orders.data.length === 0 ? (
                    <div className="card-surface p-6 text-sm text-on-surface-variant">You have not placed an order yet.</div>
                ) : (
                    <div className="space-y-3">
                        {orders.data.map((order) => (
                            <Link key={order.number} href={route('account.orders.show', order.number)} className="card-surface flex items-center justify-between p-4">
                                <div>
                                    <div className="font-display font-bold">{order.number}</div>
                                    <div className="text-sm text-on-surface-variant">{order.placed_at} · {order.status}</div>
                                </div>
                                <div className="font-semibold">{order.total}</div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
