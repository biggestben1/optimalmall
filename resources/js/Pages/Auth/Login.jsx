import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

const fieldClass = 'w-full rounded-xl border border-surface-container px-3 py-2';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    return (
        <GuestLayout title="Sign in">
            <Head title="Log in" />
            <div className="text-xs font-bold uppercase tracking-wide text-secondary">Welcome back</div>
            <h2 className="font-display text-2xl font-bold">Log in</h2>
            {status && <div className="mt-4 rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{status}</div>}
            <form onSubmit={(event) => { event.preventDefault(); post(route('login')); }} className="mt-5 space-y-4">
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Email</span>
                    <input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className={fieldClass} autoFocus required />
                    {errors.email && <span className="text-red-700">{errors.email}</span>}
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Password</span>
                    <input type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} className={fieldClass} required />
                    {errors.password && <span className="text-red-700">{errors.password}</span>}
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} />
                        Remember me
                    </label>
                    {canResetPassword && <Link href={route('password.request')} className="font-bold text-primary">Forgot password?</Link>}
                </div>
                <button type="submit" className="btn-primary w-full" disabled={processing}>Log in</button>
                <p className="text-sm text-on-surface-variant">No account? <Link href={route('register')} className="font-bold text-primary">Create one</Link></p>
            </form>
        </GuestLayout>
    );
}
