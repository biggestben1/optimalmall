import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';
import InputError from '../../Components/Admin/InputError';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    function submit(event) {
        event.preventDefault();
        post(route('two-factor.login'));
    }

    return (
        <GuestLayout>
            <Head title="Two-factor authentication" />
            <form onSubmit={submit} className="space-y-4">
                <h1 className="font-display text-xl font-bold">Enter your authentication code</h1>
                <p className="text-sm text-on-surface-variant">Use the 6-digit code from your authenticator app, or a recovery code.</p>
                <input
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                    className="w-full rounded-xl border-outline-variant"
                    autoFocus
                    required
                />
                <InputError message={errors.code} />
                <button type="submit" className="btn-primary w-full" disabled={processing}>Continue</button>
            </form>
        </GuestLayout>
    );
}
