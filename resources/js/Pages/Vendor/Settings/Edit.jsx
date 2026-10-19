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
                    <h2 className="font-display text-lg font-bold">Login details</h2>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Name</label>
                        <input value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={profile.errors.name} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Email</label>
                        <input value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={profile.errors.email} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={profile.processing}>Save account</button>
                </form>
                <form onSubmit={(event) => { event.preventDefault(); password.put(route('vendor.settings.password')); }} className="card-surface space-y-4 p-6">
                    <h2 className="font-display text-lg font-bold">Password</h2>
                    {['current_password', 'password', 'password_confirmation'].map((key) => (
                        <div key={key}>
                            <label className="mb-1 block text-xs font-bold uppercase">{key.replaceAll('_', ' ')}</label>
                            <input type="password" value={password.data[key]} onChange={(e) => password.setData(key, e.target.value)} className="w-full rounded-xl border-outline-variant" />
                            <InputError message={password.errors[key]} />
                        </div>
                    ))}
                    <button type="submit" className="btn-primary" disabled={password.processing}>Update password</button>
                </form>
            </div>
        </VendorLayout>
    );
}
