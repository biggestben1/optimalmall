import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

function caretAfterDigits(grouped, count) {
    if (count <= 0) {
        return 0;
    }

    let seen = 0;

    for (let index = 0; index < grouped.length; index += 1) {
        if (/\d/.test(grouped[index])) {
            seen += 1;
        }

        if (seen >= count) {
            return index + 1;
        }
    }

    return grouped.length;
}

function formatNairaTyping(raw, caret) {
    const left = raw.slice(0, caret);
    const dotAt = raw.indexOf('.');
    const intDigitsBefore = (dotAt === -1 ? left : left.slice(0, Math.min(caret, dotAt))).replace(/\D/g, '').length;
    const cleaned = raw.replace(/,/g, '').replace(/[^\d.]/g, '');
    const firstDot = cleaned.indexOf('.');
    const hasDot = firstDot !== -1;
    const wholeDigits = (hasDot ? cleaned.slice(0, firstDot) : cleaned).replace(/\D/g, '');
    const fractionDigits = hasDot ? cleaned.slice(firstDot + 1).replace(/\D/g, '').slice(0, 2) : '';

    if (`${wholeDigits}${fractionDigits}`.replace(/0/g, '') === '') {
        return { value: '', caret: 0 };
    }

    const whole = wholeDigits.replace(/^0+(?=\d)/, '') || '0';
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const value = `${grouped}.${fractionDigits.padEnd(2, '0')}`;
    const fracDigitsBefore = dotAt !== -1 && caret > dotAt
        ? left.slice(dotAt + 1).replace(/\D/g, '').length
        : 0;
    const nextCaret = hasDot && caret > dotAt
        ? grouped.length + 1 + Math.min(fracDigitsBefore, 2)
        : caretAfterDigits(grouped, intDigitsBefore);

    return { value, caret: nextCaret };
}

export default function Index({ balance, frozen, payments_enabled, transactions, orders, funding = [], account }) {
    const fund = useForm({ amount: '', proof: null });
    const pay = useForm({});
    const hasAccount = account?.bank || account?.name || account?.number;

    return (
        <AppLayout>
            <Head title="Wallet" />
            <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary lg:p-8">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Wallet</div>
                    <p className="mt-2 text-sm text-primary-fixed">Available balance</p>
                    <p className="font-display text-4xl font-extrabold tracking-tight">{balance}</p>
                    {frozen && <p className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-sm">This wallet is frozen. Funding and payments are paused.</p>}
                    <Link href={route('wallet.statement')} className="mt-4 inline-flex text-sm font-bold text-tertiary-fixed">Download statement</Link>
                </section>

                <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="card-surface p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-secondary">Send money to</div>
                        <h2 className="font-display text-2xl font-bold">Mall account</h2>
                        <p className="mt-2 text-sm text-on-surface-variant">Transfer the amount into this account, then upload the receipt. The balance changes only after an accountant approves it.</p>
                        {hasAccount ? (
                            <dl className="mt-4 space-y-3 text-sm">
                                {account.bank && <div><dt className="text-on-surface-variant">Bank</dt><dd className="font-semibold">{account.bank}</dd></div>}
                                {account.name && <div><dt className="text-on-surface-variant">Account name</dt><dd className="font-semibold">{account.name}</dd></div>}
                                {account.number && <div><dt className="text-on-surface-variant">Account number</dt><dd className="font-display text-3xl font-extrabold tracking-tight text-primary">{account.number}</dd></div>}
                            </dl>
                        ) : (
                            <p className="mt-4 rounded-xl bg-surface-container px-3 py-3 text-sm text-on-surface-variant">The receiving account is not saved yet. An accountant adds it from Wallets.</p>
                        )}
                    </section>
                    <section className="card-surface p-5">
                        <div className="text-xs font-bold uppercase tracking-wide text-secondary">Add money</div>
                        <h2 className="font-display text-2xl font-bold">Upload your receipt</h2>
                        <p className="mt-2 text-sm text-on-surface-variant">After you transfer, upload the receipt or screenshot so an accountant can approve it.</p>
                        <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); fund.transform((data) => ({ ...data, amount: String(data.amount).replace(/,/g, '') })); fund.post(route('wallet.funding.store'), { forceFormData: true }); }}>
                            <label className="block text-sm">
                                <span className="mb-1 block text-on-surface-variant">Amount (₦)</span>
                                <input
                                    className="w-full rounded-xl border border-surface-container px-3 py-2"
                                    inputMode="decimal"
                                    placeholder="1,000,000.00"
                                    value={fund.data.amount}
                                    onChange={(event) => {
                                        const input = event.target;
                                        const formatted = formatNairaTyping(input.value, input.selectionStart ?? input.value.length);
                                        fund.setData('amount', formatted.value);
                                        requestAnimationFrame(() => {
                                            if (document.activeElement === input) {
                                                input.setSelectionRange(formatted.caret, formatted.caret);
                                            }
                                        });
                                    }}
                                    required
                                    disabled={frozen}
                                />
                                {fund.errors.amount && <span className="text-red-700">{fund.errors.amount}</span>}
                            </label>
                            <label className="block text-sm">
                                <span className="mb-1 block text-on-surface-variant">Proof of payment</span>
                                <input className="w-full text-sm" type="file" accept="image/*,.pdf" onChange={(event) => fund.setData('proof', event.target.files?.[0] || null)} required disabled={frozen} />
                                {fund.errors.proof && <span className="text-red-700">{fund.errors.proof}</span>}
                            </label>
                            <button className="btn-accent" disabled={fund.processing || frozen}>Submit for approval</button>
                        </form>
                    </section>
                </div>

                {funding.length > 0 && (
                    <section className="card-surface mt-6 p-5">
                        <h2 className="font-display text-xl font-bold">Your funding requests</h2>
                        <ul className="mt-3 divide-y divide-surface-container text-sm">
                            {funding.map((item) => (
                                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                                    <span>{item.created_at} · {item.amount}</span>
                                    <span className="font-bold">{item.status}{item.note ? ` · ${item.note}` : ''}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {payments_enabled && orders.length > 0 && (
                    <section className="card-surface mt-6 p-5">
                        <h2 className="font-display text-xl font-bold">Pay an order</h2>
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
                    <h2 className="mb-3 font-display text-xl font-bold">History</h2>
                    <div className="card-surface overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                                <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                {transactions.data.length === 0 && (
                                    <tr><td className="px-4 py-6 text-on-surface-variant" colSpan="5">No wallet activity yet.</td></tr>
                                )}
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
