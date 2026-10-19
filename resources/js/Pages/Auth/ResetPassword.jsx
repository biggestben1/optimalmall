import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

const fieldClass = 'w-full rounded-xl border border-surface-container px-3 py-2';

export default function ResetPassword({ email, token }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    return (
        <GuestLayout title="Choose a new password">
            <Head title="Reset password" />
            <div className="text-xs font-bold uppercase tracking-wide text-secondary">Account recovery</div>
            <h2 className="font-display text-2xl font-bold">Reset password</h2>
            <form onSubmit={(event) => { event.preventDefault(); post(route('password.store')); }} className="mt-5 space-y-4">
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Email</span>
                    <input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className={fieldClass} required />
                    {errors.email && <span className="text-red-700">{errors.email}</span>}
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">New password</span>
                    <input type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} className={fieldClass} required />
                    {errors.password && <span className="text-red-700">{errors.password}</span>}
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Confirm password</span>
                    <input type="password" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} className={fieldClass} required />
                </label>
                <button type="submit" className="btn-primary w-full" disabled={processing}>Reset password</button>
            </form>
        </GuestLayout>
    );
}
