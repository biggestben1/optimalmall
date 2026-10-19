import AccountantLayout from '../../Layouts/AccountantLayout';

export default function Reports({ stats }) {
    return (
        <AccountantLayout title="Financial reports" heading="Financial reports">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="card-surface p-4">
                        <p className="text-sm capitalize text-on-surface-variant">{stat.label}</p>
                        <p className="mt-1 font-display text-2xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>
        </AccountantLayout>
    );
}
