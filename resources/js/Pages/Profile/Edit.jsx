import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

export default function Edit({ status }) {
    const user = usePage().props.auth.user;
    const profile = useForm({ name: user.name, email: user.email });
    const password = useForm({ current_password: '', password: '', password_confirmation: '' });
    const destroyForm = useForm({ password: '' });

    return (
        <AppLayout header={<h2 className="font-display text-xl font-bold">Profile</h2>}>
            <Head title="Profile" />
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 lg:px-8">
                {status && <div className="rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{status}</div>}

                <form onSubmit={(e) => { e.preventDefault(); profile.patch(route('profile.update')); }} className="card-surface space-y-4 p-6">
                    <h3 className="font-display font-bold">Profile information</h3>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Name</label>
                        <input value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        {profile.errors.name && <div className="text-sm text-red-600">{profile.errors.name}</div>}
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Email</label>
                        <input type="email" value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        {profile.errors.email && <div className="text-sm text-red-600">{profile.errors.email}</div>}
                    </div>
                    <button className="btn-primary" disabled={profile.processing}>Save</button>
                </form>

                <form onSubmit={(e) => { e.preventDefault(); password.put(route('profile.password')); }} className="card-surface space-y-4 p-6">
                    <h3 className="font-display font-bold">Update password</h3>
                    {['current_password', 'password', 'password_confirmation'].map((field) => (
                        <div key={field}>
                            <label className="mb-1 block text-xs font-bold uppercase">{field.replaceAll('_', ' ')}</label>
                            <input type="password" value={password.data[field]} onChange={(e) => password.setData(field, e.target.value)} className="w-full rounded-xl border-outline-variant" />
                            {password.errors[field] && <div className="text-sm text-red-600">{password.errors[field]}</div>}
                        </div>
                    ))}
                    <button className="btn-primary" disabled={password.processing}>Update password</button>
                </form>

                <form onSubmit={(e) => { e.preventDefault(); if (confirm('Delete your account?')) destroyForm.delete(route('profile.destroy')); }} className="card-surface space-y-4 p-6">
                    <h3 className="font-display font-bold text-red-700">Delete account</h3>
                    <input type="password" placeholder="Confirm password" value={destroyForm.data.password} onChange={(e) => destroyForm.setData('password', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    {destroyForm.errors.password && <div className="text-sm text-red-600">{destroyForm.errors.password}</div>}
                    <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white" disabled={destroyForm.processing}>Delete account</button>
                </form>
            </div>
        </AppLayout>
    );
}
