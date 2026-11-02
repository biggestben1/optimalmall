import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import InputError from '../../../Components/Admin/InputError';

export default function Edit({ staff, roles, can_delete }) {
    const { data, setData, put, processing, errors } = useForm({
        name: staff.name,
        email: staff.email,
        role: staff.role,
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.roles.update', staff.id));
    };

    return (
        <AdminLayout title="Security" heading="Edit staff">
            <Head title="Edit staff" />
            <form onSubmit={submit} className="card-surface max-w-xl space-y-4 p-6">
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Name</label>
                    <input value={data.name} onChange={(event) => setData('name', event.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.name} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Email</label>
                    <input type="email" value={data.email} onChange={(event) => setData('email', event.target.value)} className="w-full rounded-xl border-outline-variant" required />
                    <InputError message={errors.email} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Role</label>
                    <select value={data.role} onChange={(event) => setData('role', event.target.value)} className="w-full rounded-xl border-outline-variant">
                        {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                    </select>
                    <InputError message={errors.role} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">New password</label>
                    <input type="password" value={data.password} onChange={(event) => setData('password', event.target.value)} className="w-full rounded-xl border-outline-variant" autoComplete="new-password" />
                    <p className="mt-1 text-xs text-on-surface-variant">Leave this blank to keep the current password.</p>
                    <InputError message={errors.password} />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Confirm new password</label>
                    <input type="password" value={data.password_confirmation} onChange={(event) => setData('password_confirmation', event.target.value)} className="w-full rounded-xl border-outline-variant" autoComplete="new-password" />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button type="submit" className="btn-primary" disabled={processing}>Save changes</button>
                    <Link href={route('admin.roles.index')} className="rounded-xl px-4 py-2 text-sm font-bold text-on-surface-variant">Cancel</Link>
                    {can_delete && (
                        <DeleteButton href={route('admin.roles.destroy', staff.id)} confirmMessage={`Delete ${staff.name}? They will no longer be able to sign in.`} />
                    )}
                </div>
            </form>
        </AdminLayout>
    );
}
