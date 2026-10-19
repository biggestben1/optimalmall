import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ coupons }) {
    return (
        <AdminLayout title="Promotions" heading="Coupons">
            <Head title="Coupons" />
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">Discount codes for checkout.</p>
                <Link href={route('admin.coupons.create')} className="btn-primary">Add coupon</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Discount</th>
                            <th className="px-4 py-3">Used</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {coupons.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No coupons yet.</td></tr>
                        ) : coupons.data.map((coupon) => (
                            <tr key={coupon.id}>
                                <td className="px-4 py-3 font-semibold">{coupon.code}</td>
                                <td className="px-4 py-3">{coupon.discount}</td>
                                <td className="px-4 py-3">{coupon.used}</td>
                                <td className="px-4 py-3">{coupon.is_active ? 'Active' : 'Inactive'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('admin.coupons.edit', coupon.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('admin.coupons.destroy', coupon.id)} confirmMessage="Delete this coupon?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={coupons.links} />
        </AdminLayout>
    );
}
