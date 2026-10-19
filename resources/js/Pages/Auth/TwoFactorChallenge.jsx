import { Head, useForm } from '@inertiajs/react';
import InputError from '../../Components/Admin/InputError';
import GuestLayout from '../../Layouts/GuestLayout';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    return (
        <GuestLayout title="Confirm it is you">
            <Head title="Two-factor authentication" />
            <div className="text-xs font-bold uppercase tracking-wide text-secondary">Security</div>
            <h2 className="font-display text-2xl font-bold">Authentication code</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Use the 6-digit code from your authenticator app, or a recovery code.</p>
            <form onSubmit={(event) => { event.preventDefault(); post(route('two-factor.login')); }} className="mt-5 space-y-4">
                <label className="block text-sm">
                    <span className="mb-1 block text-on-surface-variant">Code</span>
                    <input value={data.code} onChange={(event) => setData('code', event.target.value)} className="w-full rounded-xl border border-surface-container px-3 py-2" autoFocus required />
                    <InputError message={errors.code} />
                </label>
                <button type="submit" className="btn-primary w-full" disabled={processing}>Continue</button>
            </form>
        </GuestLayout>
    );
}
