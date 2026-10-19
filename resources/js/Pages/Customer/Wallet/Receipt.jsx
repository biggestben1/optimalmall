import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function Receipt({ transaction }) {
    return (
        <AppLayout>
            <Head title="Wallet receipt" />
            <div className="mx-auto max-w-lg px-4 py-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary">
                    <Link href={route('wallet.index')} className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Wallet</Link>
                    <h1 className="mt-2 font-display text-3xl font-extrabold">Receipt</h1>
                    <p className="mt-3 font-display text-3xl font-extrabold">{transaction.direction === 'debit' ? '−' : '+'}{transaction.amount}</p>
                </section>
                <dl className="card-surface mt-4 space-y-3 p-5 text-sm">
                    <div><dt className="text-on-surface-variant">Reference</dt><dd className="font-semibold">{transaction.reference}</dd></div>
                    <div><dt className="text-on-surface-variant">Type</dt><dd>{transaction.type} · {transaction.direction}</dd></div>
                    <div><dt className="text-on-surface-variant">Balance after</dt><dd>{transaction.balance_after ?? '—'}</dd></div>
                    <div><dt className="text-on-surface-variant">Status</dt><dd className="font-bold">{transaction.status}</dd></div>
                    <div><dt className="text-on-surface-variant">Date</dt><dd>{transaction.created_at}</dd></div>
                    <div><dt className="text-on-surface-variant">Description</dt><dd>{transaction.description}</dd></div>
                </dl>
            </div>
        </AppLayout>
    );
}
