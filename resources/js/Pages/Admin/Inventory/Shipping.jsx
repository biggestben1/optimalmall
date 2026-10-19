import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FilterBar from '../../../Components/Admin/FilterBar';
import Pagination from '../../../Components/Admin/Pagination';

function ShipForm({ item, statuses }) {
    const [status, setStatus] = useState(item.status);
    const [carrier, setCarrier] = useState(item.carrier ?? '');
    const [tracking, setTracking] = useState(item.tracking_number ?? '');

    return (
        <form
            className="flex flex-wrap items-center justify-end gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                router.patch(route('admin.shipping.update', item.id), {
                    fulfilment_status: status,
                    carrier,
                    tracking_number: tracking,
                });
            }}
        >
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border-outline-variant text-sm">
                {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier" className="w-28 rounded-lg border-outline-variant text-sm" />
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking" className="w-32 rounded-lg border-outline-variant text-sm" />
            <button type="submit" className="font-bold text-primary">Save</button>
        </form>
    );
}

export default function Shipping({ items, filters, statuses }) {
    return (
        <AdminLayout title="Sales" heading="Shipping">
            <Head title="Shipping" />
            <p className="mb-4 text-sm text-on-surface-variant">Fulfilment is stored on the same order lines sellers use.</p>
            <FilterBar action={route('admin.shipping.index')} filters={filters} placeholder="Order, product, or tracking number" />
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Item</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {items.data.length === 0 ? (
                            <tr><td colSpan={3} className="px-4 py-8 text-center text-on-surface-variant">No shipments yet.</td></tr>
                        ) : items.data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{item.order_number}</div>
                                    <div className="text-xs text-on-surface-variant">{item.customer}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div>{item.title}</div>
                                    <div className="text-xs text-on-surface-variant">{item.vendor}</div>
                                </td>
                                <td className="px-4 py-3"><ShipForm item={item} statuses={statuses} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={items.links} />
        </AdminLayout>
    );
}
