import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

const fields = [
    ['name', 'Name', 'text'],
    ['email', 'Email', 'email'],
    ['password', 'Password', 'password'],
    ['password_confirmation', 'Confirm password', 'password'],
];

const fieldClass = 'w-full rounded-xl border border-surface-container px-3 py-2';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <GuestLayout title="Create your account">
            <Head title="Register" />
            <div className="text-xs font-bold uppercase tracking-wide text-secondary">New shopper</div>
            <h2 className="font-display text-2xl font-bold">Register</h2>
            <form onSubmit={(event) => { event.preventDefault(); post(route('register')); }} className="mt-5 space-y-4">
                {fields.map(([field, label, type]) => (
                    <label key={field} className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">{label}</span>
                        <input type={type} value={data[field]} onChange={(event) => setData(field, event.target.value)} className={fieldClass} required />
                        {errors[field] && <span className="text-red-700">{errors[field]}</span>}
                    </label>
                ))}
                <button type="submit" className="btn-primary w-full" disabled={processing}>Create account</button>
                <p className="text-sm text-on-surface-variant">Already registered? <Link href={route('login')} className="font-bold text-primary">Log in</Link></p>
            </form>
        </GuestLayout>
    );
}
