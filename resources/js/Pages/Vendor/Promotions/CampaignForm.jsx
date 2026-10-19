import { Head, Link, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function CampaignForm({ campaign }) {
    const editing = Boolean(campaign?.id);
    const { data, setData, post, put, processing, errors } = useForm({
        title: campaign.title ?? '',
        placement: campaign.placement ?? 'homepage',
        image_path: campaign.image_path ?? '',
        link_url: campaign.link_url ?? '',
        budget: campaign.budget ?? '',
        starts_at: campaign.starts_at ?? '',
        ends_at: campaign.ends_at ?? '',
        is_active: campaign.is_active ?? true,
    });

    return (
        <VendorLayout title="Growth" heading={editing ? 'Edit campaign' : 'Add campaign'}>
            <Head title="Campaign" />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (editing) {
                        put(route('vendor.promotions.campaigns.update', campaign.id));
                    } else {
                        post(route('vendor.promotions.campaigns.store'));
                    }
                }}
                className="card-surface max-w-3xl space-y-4 p-6"
            >
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Title</label>
                    <input value={data.title} onChange={(e) => setData('title', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.title} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Placement</label>
                        <select value={data.placement} onChange={(e) => setData('placement', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            <option value="homepage">Homepage</option>
                            <option value="category">Category</option>
                            <option value="search">Search</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Budget (NGN)</label>
                        <input type="number" step="0.01" value={data.budget} onChange={(e) => setData('budget', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Image URL</label>
                        <input value={data.image_path} onChange={(e) => setData('image_path', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.image_path} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Link</label>
                        <input value={data.link_url} onChange={(e) => setData('link_url', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.link_url} />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                    Active
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={processing}>Save campaign</button>
                    <Link href={route('vendor.promotions.index')} className="px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                </div>
            </form>
        </VendorLayout>
    );
}
