import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    return (
        <GuestLayout>
            <Head title="Log in" />
            {status && <div className="mb-4 text-sm font-medium text-tertiary">{status}</div>}
            <form onSubmit={(e) => { e.preventDefault(); post(route('login')); }} className="space-y-4">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full rounded-xl border-outline-variant" autoFocus />
                    {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Password</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                    Remember me
                </label>
                <div className="flex items-center justify-between">
                    {canResetPassword && <Link href={route('password.request')} className="text-sm text-primary underline">Forgot password?</Link>}
                    <button type="submit" className="btn-primary" disabled={processing}>Log in</button>
                </div>
                <p className="text-sm text-on-surface-variant">No account? <Link href={route('register')} className="font-bold text-primary">Register</Link></p>
            </form>
        </GuestLayout>
    );
}
