import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FilterBar from '../../../Components/Admin/FilterBar';
import InputError from '../../../Components/Admin/InputError';
import Pagination from '../../../Components/Admin/Pagination';

function VendorRate({ vendor }) {
    const { data, setData, patch, processing, errors } = useForm({
        commission_rate: vendor.commission_rate ?? '',
    });

    return (
        <form
            className="flex items-center justify-end gap-2"
            onSubmit={(event) => {
                event.preventDefault();
                patch(route('admin.commissions.vendor', vendor.id));
            }}
        >
            <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.commission_rate}
                onChange={(e) => setData('commission_rate', e.target.value)}
                placeholder="Global"
                className="w-24 rounded-lg border-outline-variant text-sm"
            />
            <button type="submit" className="font-bold text-primary" disabled={processing}>Save</button>
            <InputError message={errors.commission_rate} />
        </form>
    );
}

export default function Index({ vendors, filters, commission_rate }) {
    const form = useForm({ commission_rate });

    return (
        <AdminLayout title="Finance" heading="Commissions">
            <Head title="Commissions" />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    form.put(route('admin.commissions.update'));
                }}
                className="card-surface mb-6 flex flex-wrap items-end gap-3 p-5"
            >
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Marketplace rate (%)</label>
                    <input type="number" min="0" max="100" step="0.01" value={form.data.commission_rate} onChange={(e) => form.setData('commission_rate', e.target.value)} className="rounded-xl border-outline-variant" />
                    <InputError message={form.errors.commission_rate} />
                </div>
                <button type="submit" className="btn-primary" disabled={form.processing}>Save global rate</button>
                <p className="text-sm text-on-surface-variant">Seller overrides apply when the box has a number. Empty uses the marketplace rate. Rates already stored on paid order lines stay as they were.</p>
            </form>
            <FilterBar action={route('admin.commissions.index')} filters={filters} placeholder="Seller name" />
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Seller</th>
                            <th className="px-4 py-3">Verified sales</th>
                            <th className="px-4 py-3">Commission</th>
                            <th className="px-4 py-3">Available</th>
                            <th className="px-4 py-3">Override %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {vendors.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No sellers yet.</td></tr>
                        ) : vendors.data.map((vendor) => (
                            <tr key={vendor.id}>
                                <td className="px-4 py-3 font-semibold">{vendor.name}</td>
                                <td className="px-4 py-3">{vendor.gross}</td>
                                <td className="px-4 py-3">{vendor.commission}</td>
                                <td className="px-4 py-3">{vendor.available}</td>
                                <td className="px-4 py-3"><VendorRate vendor={vendor} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={vendors.links} />
        </AdminLayout>
    );
}
