import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <GuestLayout>
            <Head title="Register" />
            <form onSubmit={(e) => { e.preventDefault(); post(route('register')); }} className="space-y-4">
                {['name', 'email', 'password', 'password_confirmation'].map((field) => (
                    <div key={field}>
                        <label className="mb-1 block text-xs font-bold uppercase">{field.replace('_', ' ')}</label>
                        <input
                            type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                            value={data[field]}
                            onChange={(e) => setData(field, e.target.value)}
                            className="w-full rounded-xl border-outline-variant"
                        />
                        {errors[field] && <div className="mt-1 text-sm text-red-600">{errors[field]}</div>}
                    </div>
                ))}
                <div className="flex items-center justify-between">
                    <Link href={route('login')} className="text-sm text-primary underline">Already registered?</Link>
                    <button type="submit" className="btn-primary" disabled={processing}>Register</button>
                </div>
            </form>
        </GuestLayout>
    );
}
