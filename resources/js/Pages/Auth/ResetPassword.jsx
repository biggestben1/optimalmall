import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ResetPassword({ email, token }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    return (
        <GuestLayout>
            <Head title="Reset password" />
            <form onSubmit={(e) => { e.preventDefault(); post(route('password.store')); }} className="space-y-4">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Password</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Confirm password</label>
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                </div>
                <button type="submit" className="btn-primary" disabled={processing}>Reset password</button>
            </form>
        </GuestLayout>
    );
}
