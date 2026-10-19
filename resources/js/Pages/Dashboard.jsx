import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AppLayout header={<h2 className="font-display text-xl font-bold text-on-surface">Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="card-surface p-6">
                    <p className="text-sm text-on-surface-variant">Welcome to OptimalMall. Order history and wishlist arrive in later phases.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link href={route('products.index')} className="btn-primary inline-flex">Continue shopping</Link>
                        {auth.user?.role === 'customer' && (
                            <Link href={route('wallet.index')} className="inline-flex rounded-lg border px-4 py-2 text-sm font-bold">Open wallet</Link>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
