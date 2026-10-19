import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';
import Pagination from '../../../Components/Admin/Pagination';

function RoleForm({ user, roles }) {
    const { data, setData, patch, processing } = useForm({ role: user.role });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                patch(route('admin.roles.update', user.id));
            }}
            className="flex items-center justify-end gap-2"
        >
            <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="rounded-lg border-outline-variant text-sm">
                {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
            <button type="submit" className="font-bold text-primary" disabled={processing}>Save</button>
        </form>
    );
}

export default function Index({ users, roles, permissions = [], modules = {} }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'customer_support',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.roles.store'), { onSuccess: () => reset('name', 'email', 'password') });
    };

    return (
        <AdminLayout title="Security" heading="Roles & Security">
            <Head title="Roles & Security" />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                    <div className="card-surface overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-3 font-semibold">{user.name}</td>
                                        <td className="px-4 py-3">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <RoleForm user={user} roles={roles} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={users.links} />
                </div>
                <form onSubmit={submit} className="card-surface h-fit space-y-4 p-5">
                    <h2 className="font-display text-lg font-bold">New staff account</h2>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Name</label>
                        <input value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Email</label>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.email} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Password</label>
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full rounded-xl border-outline-variant" required />
                        <InputError message={errors.password} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Role</label>
                        <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                        </select>
                        <InputError message={errors.role} />
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={processing}>Create account</button>
                </form>
            </div>
            <div className="card-surface mt-6 overflow-x-auto p-5">
                <h2 className="font-display text-lg font-bold">Module access</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Staff only see the modules listed for their role. The master admin can open every module. Sellers never enter this console.</p>
                <table className="mt-4 min-w-full text-left text-sm">
                    <thead className="text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Modules</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {permissions.map((row) => (
                            <tr key={row.role}>
                                <td className="px-3 py-2 font-semibold">{roles.find((role) => role.value === row.role)?.label ?? row.role}</td>
                                <td className="px-3 py-2">{row.modules.map((module) => modules[module] ?? module).join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
