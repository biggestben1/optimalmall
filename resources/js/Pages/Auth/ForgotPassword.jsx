import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <GuestLayout title="Reset your password">
            <Head title="Forgot password" />
            <div className="text-xs font-bold uppercase tracking-wide text-secondary">Account recovery</div>
            <h2 className="font-display text-2xl font-bold">Forgot password</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Enter your email and we’ll send a reset link if the account exists.</p>
            {status && <div className="mt-4 rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{status}</div>}
            <form onSubmit={(event) => { event.preventDefault(); post(route('password.email')); }} className="mt-5 space-y-4">
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Email</span>
                    <input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" required />
                    {errors.email && <span className="text-red-700">{errors.email}</span>}
                </label>
                <button type="submit" className="btn-primary w-full" disabled={processing}>Email reset link</button>
                <Link href={route('login')} className="inline-flex text-sm font-bold text-primary">Back to log in</Link>
            </form>
        </GuestLayout>
    );
}
