import { useForm } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Expenses({ expenses, can_record }) {
    const form = useForm({ category: 'other', amount: '', spent_on: '', description: '', attachment: null });

    return (
        <AccountantLayout title="Expenses" heading="Operating expenses" intro="Record a mall expense, then approve it before it hits the books.">
            {can_record && (
                <form className="card-surface mb-6 grid gap-3 p-5 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); form.post(route('accountant.expenses'), { forceFormData: true }); }}>
                    <select className="rounded-lg border px-3 py-2 text-sm" value={form.data.category} onChange={(event) => form.setData('category', event.target.value)}>
                        <option value="rent">Rent</option>
                        <option value="logistics">Logistics</option>
                        <option value="marketing">Marketing</option>
                        <option value="software">Software</option>
                        <option value="other">Other</option>
                    </select>
                    <input className="rounded-lg border px-3 py-2 text-sm" type="number" step="0.01" placeholder="Amount" value={form.data.amount} onChange={(event) => form.setData('amount', event.target.value)} required />
                    <input className="rounded-lg border px-3 py-2 text-sm" type="date" value={form.data.spent_on} onChange={(event) => form.setData('spent_on', event.target.value)} required />
                    <input className="rounded-lg border px-3 py-2 text-sm" type="file" onChange={(event) => form.setData('attachment', event.target.files[0] ?? null)} />
                    <input className="rounded-lg border px-3 py-2 text-sm md:col-span-2" placeholder="Description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} required />
                    <button className="btn-primary md:col-span-2 md:w-fit" disabled={form.processing}>Submit for approval</button>
                </form>
            )}
            <div className="space-y-3">
                {expenses.data.map((expense) => (
                    <div key={expense.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                        <div>
                            <p className="font-semibold">{expense.category} · {expense.amount}</p>
                            <p>{expense.description}</p>
                            <p className="text-on-surface-variant">{expense.spent_on} · {expense.status}</p>
                        </div>
                        {expense.can_approve && <Approve expense={expense} />}
                    </div>
                ))}
                {expenses.data.length === 0 && <p className="card-surface px-5 py-8 text-center text-sm text-on-surface-variant">No expenses yet.</p>}
            </div>
            <Pagination links={expenses.links} />
        </AccountantLayout>
    );
}

function Approve({ expense }) {
    const form = useForm({ password: '' });

    return (
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); form.post(route('accountant.expenses.approve', expense.id)); }}>
            <input className="rounded-lg border px-2 py-1 text-xs" type="password" placeholder="Password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required />
            <button className="font-bold text-primary">Approve</button>
        </form>
    );
}
