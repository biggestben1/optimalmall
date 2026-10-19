import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function Index({ balance, frozen, deposits_enabled, payments_enabled, limits, transactions, orders }) {
    const fund = useForm({ amount: '' });
    const pay = useForm({});

    return (
        <AppLayout>
            <Head title="Wallet" />
            <div className="mx-auto max-w-4xl px-4 py-8">
                <h1 className="font-display text-3xl font-bold">Wallet</h1>
                <div className="card-surface mt-4 p-5">
                    <p className="text-sm text-on-surface-variant">Available balance</p>
                    <p className="font-display text-3xl font-bold">{balance}</p>
                    {frozen && <p className="mt-2 text-sm text-secondary">This wallet is frozen. Funding and payments are paused.</p>}
                    <p className="mt-3 text-sm text-on-surface-variant">Limits: {limits.transaction} per transaction, {limits.daily} per day, {limits.balance} maximum balance.</p>
                    <Link className="mt-3 inline-block text-sm font-semibold text-primary" href={route('wallet.statement')}>Download statement</Link>
                </div>
                <section className="card-surface mt-4 p-5">
                    <h2 className="font-display text-lg font-bold">Add funds</h2>
                    {deposits_enabled ? (
                        <form className="mt-3 flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); fund.post(route('wallet.fund')); }}>
                            <input className="rounded-lg border px-3 py-2 text-sm" type="number" min="1" step="0.01" placeholder="Amount" value={fund.data.amount} onChange={(event) => fund.setData('amount', event.target.value)} required />
                            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" disabled={fund.processing}>Create funding reference</button>
                        </form>
                    ) : (
                        <p className="mt-2 text-sm text-on-surface-variant">Customer deposits stay off until a licensed payment provider is connected and the applicable Nigerian rules are confirmed.</p>
                    )}
                </section>
                {payments_enabled && orders.length > 0 && (
                    <section className="card-surface mt-4 p-5">
                        <h2 className="font-display text-lg font-bold">Pay an order</h2>
                        <ul className="mt-3 space-y-2 text-sm">
                            {orders.map((order) => (
                                <li key={order.id} className="flex items-center justify-between gap-3">
                                    <span>{order.number} · {order.total}</span>
                                    <button className="font-bold text-primary" disabled={pay.processing} onClick={() => pay.post(route('wallet.pay', order.id))}>Pay</button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                <section className="mt-6">
                    <h2 className="mb-3 font-display text-lg font-bold">History</h2>
                    <div className="card-surface overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                                <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                {transactions.data.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3">{row.created_at}</td>
                                        <td className="px-4 py-3"><Link className="font-semibold text-primary" href={route('wallet.receipt', row.id)}>{row.reference}</Link></td>
                                        <td className="px-4 py-3">{row.type}</td>
                                        <td className="px-4 py-3">{row.direction === 'debit' ? '−' : '+'}{row.amount}</td>
                                        <td className="px-4 py-3">{row.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
