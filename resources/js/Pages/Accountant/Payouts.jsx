import { router, useForm } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';
import Pagination from '../../Components/Admin/Pagination';

export default function Payouts({ payouts, threshold }) {
    return (
        <AccountantLayout title="Payouts" heading="Vendor payout queue" intro={`Approval does not pay the seller. Amounts at or above ${threshold} need a master admin. A payout is paid only after the bank reference is confirmed.`}>
            <div className="space-y-3">
                {payouts.data.map((payout) => (
                    <article key={payout.id} className="card-surface p-4 text-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold">{payout.reference} · {payout.vendor}</p>
                                <p>{payout.amount} · {payout.status_label}</p>
                                <p className="text-on-surface-variant">{payout.bank}</p>
                                {payout.provider_reference && <p>Bank reference {payout.provider_reference}</p>}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {payout.can_approve && <button className="font-bold text-primary" onClick={() => { if (window.confirm('Approve this request? It will not be paid yet.')) router.patch(route('admin.payouts.approve', payout.id)); }}>Approve</button>}
                                {payout.can_start && <button className="font-bold text-primary" onClick={() => { if (window.confirm('Start the bank payment? It stays unpaid until confirmed.')) router.patch(route('admin.payouts.release', payout.id)); }}>Start payment</button>}
                                {(payout.status === 'requested' || payout.status === 'approved') && <button className="font-bold text-secondary" onClick={() => { if (window.confirm('Reject this request?')) router.patch(route('admin.payouts.reject', payout.id)); }}>Reject</button>}
                            </div>
                        </div>
                        {payout.can_confirm && <Confirm payout={payout} />}
                    </article>
                ))}
                {payouts.data.length === 0 && <p className="card-surface px-5 py-8 text-center text-sm text-on-surface-variant">No payout requests yet.</p>}
            </div>
            <Pagination links={payouts.links} />
        </AccountantLayout>
    );
}

function Confirm({ payout }) {
    const form = useForm({ password: '', provider_reference: '' });

    return (
        <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); form.post(route('admin.payouts.confirm', payout.id)); }}>
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Bank or provider reference" value={form.data.provider_reference} onChange={(event) => form.setData('provider_reference', event.target.value)} required />
            <input className="rounded-lg border px-3 py-2 text-sm" type="password" placeholder="Your password" value={form.data.password} onChange={(event) => form.setData('password', event.target.value)} required />
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" disabled={form.processing}>Confirm settlement</button>
        </form>
    );
}
