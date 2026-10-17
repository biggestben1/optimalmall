import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <GuestLayout>
            <Head title="Forgot password" />
            <p className="mb-4 text-sm text-on-surface-variant">Enter your email and we’ll send a reset link if the account exists.</p>
            {status && <div className="mb-4 text-sm font-medium text-tertiary">{status}</div>}
            <form onSubmit={(e) => { e.preventDefault(); post(route('password.email')); }} className="space-y-4">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                </div>
                <button type="submit" className="btn-primary" disabled={processing}>Email reset link</button>
            </form>
        </GuestLayout>
    );
}
