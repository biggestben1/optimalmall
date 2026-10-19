import { Head, Link } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ coupons, campaigns }) {
    return (
        <VendorLayout title="Growth" heading="Promotions">
            <Head title="Promotions" />
            <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Discounts</h2>
                <Link href={route('vendor.promotions.coupons.create')} className="btn-primary">Add discount</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Value</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {coupons.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No discounts yet.</td></tr>
                        ) : coupons.data.map((coupon) => (
                            <tr key={coupon.id}>
                                <td className="px-4 py-3 font-semibold">{coupon.code}</td>
                                <td className="px-4 py-3">{coupon.type}</td>
                                <td className="px-4 py-3">{coupon.value}</td>
                                <td className="px-4 py-3">{coupon.is_active ? 'Yes' : 'No'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('vendor.promotions.coupons.edit', coupon.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('vendor.promotions.coupons.destroy', coupon.id)} confirmMessage="Delete this discount?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={coupons.links} />

            <div className="mb-3 mt-8 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Campaigns</h2>
                <Link href={route('vendor.promotions.campaigns.create')} className="btn-primary">Add campaign</Link>
            </div>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Placement</th>
                            <th className="px-4 py-3">Budget</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {campaigns.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No campaigns yet.</td></tr>
                        ) : campaigns.data.map((campaign) => (
                            <tr key={campaign.id}>
                                <td className="px-4 py-3 font-semibold">{campaign.title}</td>
                                <td className="px-4 py-3">{campaign.placement}</td>
                                <td className="px-4 py-3">{campaign.budget}</td>
                                <td className="px-4 py-3">{campaign.is_active ? 'Yes' : 'No'}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('vendor.promotions.campaigns.edit', campaign.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('vendor.promotions.campaigns.destroy', campaign.id)} confirmMessage="Delete this campaign?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={campaigns.links} />
        </VendorLayout>
    );
}
