import { useForm } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Periods({ periods, can_close }) {
    const form = useForm({ label: '', starts_on: '', ends_on: '', notes: '', password: '' });

    return (
        <AccountantLayout title="Period closing" heading="Period closing">
            {can_close && (
                <form className="card-surface mb-6 grid gap-3 p-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); form.post(route('accountant.periods')); }}>
                    <input className="rounded-lg border px-3 py-2 text-sm md:col-span-2" placeholder="Label, for example October 2026" value={form.data.label} onChange={(event) => form.setData('label', event.target.value)} required />
                    <input className="rounded-lg border px-3 py-2 text-sm" type="date" value={form.data.starts_on} onChange={(event) => form.setData('starts_on', event.target.value)} required />
                    <input className="rounded-lg border px-3 py-2 text-sm" type="date" value={form.data.ends_on} onChange={(event) => form.setData('ends_on', event.target.value)} required />
                    <textarea className="rounded-lg border px-3 py-2 text-sm md:col-span-2" placeholder="Notes" value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
                    <input className="rounded-lg border px-3 py-2 text-sm" type="password" placeholder="Your password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required />
                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" disabled={form.processing}>Close period</button>
                </form>
            )}
            <div className="space-y-3">
                {periods.data.map((period) => (
                    <div key={period.label} className="card-surface p-4 text-sm">
                        <p className="font-semibold">{period.label}</p>
                        <p className="text-on-surface-variant">{period.range} · {period.status} · {period.differences}</p>
                    </div>
                ))}
            </div>
            <Pagination links={periods.links} />
        </AccountantLayout>
    );
}
