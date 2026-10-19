import AccountantLayout from '../../Layouts/AccountantLayout';

const figures = {
    Payments: ['payments', 'Money collected from shoppers'],
    Refunds: ['undo', 'Amounts already returned'],
    Commission: ['percent', 'Marketplace income'],
    'Vendor payables': ['storefront', 'Owed to sellers'],
    'Customer liabilities': ['account_balance_wallet', 'Customer wallet balances'],
    'Pending payouts': ['schedule', 'Requested and not yet paid'],
    'Gateway fees': ['toll', 'Provider charges'],
    Bank: ['account_balance', 'Settled in the bank account'],
    Clearing: ['sync', 'Still with the payment provider'],
    Unreconciled: ['rule', 'Items still waiting for a match'],
};

export default function Reports({ stats }) {
    return (
        <AccountantLayout title="Financial reports" heading="Financial reports" intro="These figures come from the books. Customer and seller balances are liabilities, not mall profit.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => {
                    const [icon, detail] = figures[stat.label] || ['monitoring', 'From the ledger'];

                    return (
                        <article key={stat.label} className="card-surface p-5">
                            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                                <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
                                {stat.label}
                            </div>
                            <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-primary">{stat.value}</p>
                            <p className="mt-2 text-sm text-on-surface-variant">{detail}</p>
                        </article>
                    );
                })}
            </div>
        </AccountantLayout>
    );
}
