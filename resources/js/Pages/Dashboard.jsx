import { Head, Link } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

export default function Dashboard() {
    return (
        <AppLayout header={<h2 className="font-display text-xl font-bold text-on-surface">Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="card-surface p-6">
                    <p className="text-sm text-on-surface-variant">Welcome to OptimalMall. Order history and wishlist arrive in later phases.</p>
                    <Link href={route('products.index')} className="btn-primary mt-4 inline-flex">Continue shopping</Link>
                </div>
            </div>
        </AppLayout>
    );
}
