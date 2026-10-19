import { Head, Link } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import Pagination from '../../../Components/Admin/Pagination';
import SearchForm from '../../../Components/Vendor/SearchForm';

export default function Index({ orders, filters = {} }) {
    return (
        <VendorLayout title="Fulfilment" heading="Orders">
            <Head title="Orders" />
            <p className="mb-4 text-sm text-on-surface-variant">Only orders that include your products are listed.</p>
            <SearchForm action={route('vendor.orders.index')} values={filters}>
                <input name="q" defaultValue={filters.q ?? ''} placeholder="Order number or customer" className="rounded-xl border-outline-variant" />
                <select name="status" defaultValue={filters.status ?? ''} className="rounded-xl border-outline-variant">
                    <option value="">Any status</option>
                    {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </SearchForm>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Fulfilment</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {orders.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No orders yet.</td></tr>
                        ) : orders.data.map((order) => (
                            <tr key={order.id}>
                                <td className="px-4 py-3 font-semibold">{order.number}<div className="text-xs text-on-surface-variant">{order.placed_at}</div></td>
                                <td className="px-4 py-3">{order.customer_name}</td>
                                <td className="px-4 py-3">{order.fulfilment}</td>
                                <td className="px-4 py-3">{order.total}</td>
                                <td className="px-4 py-3 text-right">
                                    <Link href={route('vendor.orders.show', order.id)} className="font-bold text-primary">Open</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={orders.links} />
        </VendorLayout>
    );
}
