import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';

const passwordFields = [
    ['current_password', 'Current password'],
    ['password', 'New password'],
    ['password_confirmation', 'Confirm new password'],
];

export default function Edit({ status }) {
    const user = usePage().props.auth.user;
    const profile = useForm({ name: user.name, email: user.email });
    const password = useForm({ current_password: '', password: '', password_confirmation: '' });
    const destroyForm = useForm({ password: '' });
    const firstName = user.name?.split(' ')[0] || 'there';

    return (
        <AppLayout>
            <Head title="Profile" />
            <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary lg:p-8">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Profile</div>
                    <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Hello, {firstName}</h1>
                    <p className="mt-2 text-sm text-primary-fixed">{user.email}</p>
                </section>

                {status && <div className="mt-4 rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{status}</div>}

                <form onSubmit={(event) => { event.preventDefault(); profile.patch(route('profile.update')); }} className="card-surface mt-6 space-y-4 p-5 lg:p-6">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-secondary">Account</div>
                        <h2 className="font-display text-2xl font-bold">Your details</h2>
                    </div>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Name</span>
                        <input value={profile.data.name} onChange={(event) => profile.setData('name', event.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" />
                        {profile.errors.name && <span className="text-red-700">{profile.errors.name}</span>}
                    </label>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Email</span>
                        <input type="email" value={profile.data.email} onChange={(event) => profile.setData('email', event.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" />
                        {profile.errors.email && <span className="text-red-700">{profile.errors.email}</span>}
                    </label>
                    <button className="btn-primary" disabled={profile.processing}>Save details</button>
                </form>

                <form onSubmit={(event) => { event.preventDefault(); password.put(route('profile.password')); }} className="card-surface mt-4 space-y-4 p-5 lg:p-6">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-secondary">Security</div>
                        <h2 className="font-display text-2xl font-bold">Password</h2>
                    </div>
                    {passwordFields.map(([field, label]) => (
                        <label key={field} className="block text-sm">
                            <span className="mb-1 block text-on-surface-variant">{label}</span>
                            <input type="password" value={password.data[field]} onChange={(event) => password.setData(field, event.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" />
                            {password.errors[field] && <span className="text-red-700">{password.errors[field]}</span>}
                        </label>
                    ))}
                    <button className="btn-primary" disabled={password.processing}>Update password</button>
                </form>

                <form onSubmit={(event) => { event.preventDefault(); if (confirm('Delete your account?')) destroyForm.delete(route('profile.destroy')); }} className="card-surface mt-4 space-y-4 border border-red-100 p-5 lg:p-6">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-red-700">Danger</div>
                        <h2 className="font-display text-2xl font-bold">Delete account</h2>
                        <p className="mt-1 text-sm text-on-surface-variant">This removes your login. Orders already placed stay on record.</p>
                    </div>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Confirm with your password</span>
                        <input type="password" value={destroyForm.data.password} onChange={(event) => destroyForm.setData('password', event.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" />
                        {destroyForm.errors.password && <span className="text-red-700">{destroyForm.errors.password}</span>}
                    </label>
                    <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white" disabled={destroyForm.processing}>Delete account</button>
                </form>
            </div>
        </AppLayout>
    );
}
