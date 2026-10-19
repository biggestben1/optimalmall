import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ orders }) {
    return (
        <AdminLayout title="Sales" heading="Orders">
            <Head title="Orders" />
            <p className="mb-4 text-sm text-on-surface-variant">Customer orders placed on OptimalMall.</p>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Placed</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {orders.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No orders yet.</td></tr>
                        ) : orders.data.map((order) => (
                            <tr key={order.id}>
                                <td className="px-4 py-3 font-semibold">{order.number}</td>
                                <td className="px-4 py-3">{order.customer_name}</td>
                                <td className="px-4 py-3">{order.status_label}</td>
                                <td className="px-4 py-3">{order.total}</td>
                                <td className="px-4 py-3">{order.placed_at}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={route('admin.orders.show', order.id)} className="font-bold text-primary">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={orders.links} />
        </AdminLayout>
    );
}
