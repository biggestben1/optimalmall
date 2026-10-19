import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Edit({ enabled, required, pending_secret, recovery_codes }) {
    const confirm = useForm({ code: '' });
    const disable = useForm({ password: '' });
    const issuer = 'OptimalMall';
    const account = 'admin';
    const otpauth = pending_secret
        ? `otpauth://totp/${issuer}:${account}?secret=${pending_secret}&issuer=${issuer}`
        : '';

    return (
        <AdminLayout title="System" heading="Two-factor authentication">
            <Head title="Two-factor authentication" />
            {required && !enabled && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    This role must turn on an authenticator app before the rest of the admin console opens.
                </div>
            )}
            {recovery_codes?.length > 0 && (
                <div className="card-surface mb-4 p-5">
                    <h2 className="font-display text-lg font-bold">Recovery codes</h2>
                    <p className="mt-1 text-sm text-on-surface-variant">Save these now. They are shown once.</p>
                    <ul className="mt-3 grid gap-1 font-mono text-sm sm:grid-cols-2">
                        {recovery_codes.map((code) => <li key={code}>{code}</li>)}
                    </ul>
                </div>
            )}
            <div className="card-surface max-w-xl space-y-4 p-6">
                <p className="text-sm text-on-surface-variant">
                    {enabled ? 'An authenticator app is required at sign-in.' : 'Add a 6-digit code from an authenticator app.'}
                    {required ? ' It is mandatory for this role.' : ''}
                </p>
                {!enabled && !pending_secret && (
                    <button type="button" className="btn-primary" onClick={() => router.post(route('admin.security.start'))}>Start setup</button>
                )}
                {pending_secret && (
                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            confirm.post(route('admin.security.store'));
                        }}
                    >
                        <p className="text-sm">Secret: <span className="font-mono font-bold">{pending_secret}</span></p>
                        <p className="break-all text-xs text-on-surface-variant">{otpauth}</p>
                        <input value={confirm.data.code} onChange={(e) => confirm.setData('code', e.target.value)} inputMode="numeric" placeholder="6-digit code" className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={confirm.errors.code} />
                        <button type="submit" className="btn-primary" disabled={confirm.processing}>Confirm</button>
                    </form>
                )}
                {enabled && !required && (
                    <form
                        className="space-y-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (window.confirm('Turn off two-factor authentication?')) disable.delete(route('admin.security.destroy'));
                        }}
                    >
                        <input type="password" value={disable.data.password} onChange={(e) => disable.setData('password', e.target.value)} placeholder="Current password" className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={disable.errors.password} />
                        <button type="submit" className="font-bold text-secondary" disabled={disable.processing}>Turn off</button>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
}
