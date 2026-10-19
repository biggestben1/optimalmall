import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Edit({ shop }) {
    const { data, setData, put, processing, errors } = useForm({
        name: shop.name ?? '',
        business_name: shop.business_name ?? '',
        registration_number: shop.registration_number ?? '',
        description: shop.description ?? '',
        email: shop.email ?? '',
        phone: shop.phone ?? '',
        city: shop.city ?? '',
        state: shop.state ?? '',
        address: shop.address ?? '',
        logo_path: shop.logo_path ?? '',
    });

    return (
        <VendorLayout title="Shop" heading="Store profile">
            <Head title="Store profile" />
            <form onSubmit={(event) => { event.preventDefault(); put(route('vendor.store.update')); }} className="card-surface max-w-3xl space-y-4 p-6">
                <p className="text-sm text-on-surface-variant">Status: {shop.status_label}. Only an admin can activate or suspend the shop.</p>
                {[
                    ['name', 'Shop name'],
                    ['business_name', 'Registered business name'],
                    ['registration_number', 'Registration number'],
                    ['email', 'Public email'],
                    ['phone', 'Phone'],
                    ['address', 'Address'],
                    ['city', 'City'],
                    ['state', 'State'],
                    ['logo_path', 'Logo URL'],
                ].map(([key, label]) => (
                    <div key={key}>
                        <label className="mb-1 block text-xs font-bold uppercase">{label}</label>
                        <input value={data[key]} onChange={(e) => setData(key, e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors[key]} />
                    </div>
                ))}
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">About the shop</label>
                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className="w-full rounded-xl border-outline-variant" />
                    <InputError message={errors.description} />
                </div>
                <button type="submit" className="btn-primary" disabled={processing}>Save profile</button>
            </form>
        </VendorLayout>
    );
}
