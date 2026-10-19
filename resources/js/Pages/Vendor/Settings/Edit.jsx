import { Head, useForm } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Edit({ account }) {
    const profile = useForm({ name: account.name, email: account.email });
    const password = useForm({ current_password: '', password: '', password_confirmation: '' });

    return (
        <VendorLayout title="Account" heading="Settings">
            <Head title="Settings" />
            <div className="grid gap-4 lg:grid-cols-2">
                <form onSubmit={(event) => { event.preventDefault(); profile.put(route('vendor.settings.update')); }} className="card-surface space-y-4 p-6">
                    <div className="text-xs font-bold uppercase tracking-wide text-secondary">Account</div>
                    <h2 className="font-display text-2xl font-bold">Login details</h2>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Name</span>
                        <input value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" />
                        <InputError message={profile.errors.name} />
                    </label>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Email</span>
                        <input value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" />
                        <InputError message={profile.errors.email} />
                    </label>
                    <button type="submit" className="btn-primary" disabled={profile.processing}>Save account</button>
                </form>
                <form onSubmit={(event) => { event.preventDefault(); password.put(route('vendor.settings.password')); }} className="card-surface space-y-4 p-6">
                    <div className="text-xs font-bold uppercase tracking-wide text-secondary">Security</div>
                    <h2 className="font-display text-2xl font-bold">Password</h2>
                    {[['current_password', 'Current password'], ['password', 'New password'], ['password_confirmation', 'Confirm new password']].map(([key, label]) => (
                        <label key={key} className="block text-sm">
                            <span className="mb-1 block text-on-surface-variant">{label}</span>
                            <input type="password" value={password.data[key]} onChange={(e) => password.setData(key, e.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" />
                            <InputError message={password.errors[key]} />
                        </label>
                    ))}
                    <button type="submit" className="btn-primary" disabled={password.processing}>Update password</button>
                </form>
            </div>
        </VendorLayout>
    );
}
