import { Head, Link } from '@inertiajs/react';
import Pagination from '../../../Components/Admin/Pagination';
import AppLayout from '../../../Layouts/AppLayout';

const statusTone = {
    Pending: 'bg-secondary-container text-on-secondary',
    Paid: 'bg-primary-container text-on-primary',
    Processing: 'bg-tertiary-fixed text-tertiary',
    Shipped: 'bg-primary text-on-primary',
    Delivered: 'bg-tertiary text-on-primary',
    Cancelled: 'bg-red-100 text-red-800',
};

export default function Index({ orders }) {
    return (
        <AppLayout>
            <Head title="My orders" />
            <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary lg:p-8">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Orders</div>
                    <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">My orders</h1>
                    <p className="mt-2 max-w-xl text-sm text-primary-fixed">Open an order to see delivery, tracking, and a return request.</p>
                </section>

                {orders.data.length === 0 ? (
                    <div className="card-surface mt-6 px-5 py-10 text-center">
                        <span className="material-symbols-outlined text-[36px] text-primary">shopping_bag</span>
                        <p className="mt-2 font-display text-xl font-bold">No orders yet</p>
                        <p className="mt-1 text-sm text-on-surface-variant">When you check out, the order shows up here.</p>
                        <Link href={route('products.index')} className="btn-primary mt-4">Start shopping</Link>
                    </div>
                ) : (
                    <div className="mt-6 space-y-3">
                        {orders.data.map((order) => (
                            <Link key={order.number} href={route('account.orders.show', order.number)} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
                                <span>
                                    <span className="block font-display text-lg font-bold text-primary">{order.number}</span>
                                    <span className="text-sm text-on-surface-variant">{order.placed_at}</span>
                                </span>
                                <span className="flex items-center gap-3">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[order.status] || 'bg-surface-container text-on-surface'}`}>{order.status}</span>
                                    <span className="font-display text-lg font-extrabold">{order.total}</span>
                                </span>
                            </Link>
                        ))}
                        <Pagination links={orders.links} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
