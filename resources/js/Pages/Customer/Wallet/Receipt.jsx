import { Head } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

export default function Receipt({ transaction }) {
    return (
        <AppLayout>
            <Head title="Wallet receipt" />
            <div className="mx-auto max-w-lg px-4 py-8">
                <h1 className="font-display text-2xl font-bold">Wallet receipt</h1>
                <dl className="card-surface mt-4 space-y-3 p-5 text-sm">
                    <div><dt className="text-on-surface-variant">Reference</dt><dd className="font-semibold">{transaction.reference}</dd></div>
                    <div><dt className="text-on-surface-variant">Type</dt><dd>{transaction.type} · {transaction.direction}</dd></div>
                    <div><dt className="text-on-surface-variant">Amount</dt><dd>{transaction.amount}</dd></div>
                    <div><dt className="text-on-surface-variant">Balance after</dt><dd>{transaction.balance_after ?? '—'}</dd></div>
                    <div><dt className="text-on-surface-variant">Status</dt><dd>{transaction.status}</dd></div>
                    <div><dt className="text-on-surface-variant">Date</dt><dd>{transaction.created_at}</dd></div>
                    <div><dt className="text-on-surface-variant">Description</dt><dd>{transaction.description}</dd></div>
                </dl>
            </div>
        </AppLayout>
    );
}
