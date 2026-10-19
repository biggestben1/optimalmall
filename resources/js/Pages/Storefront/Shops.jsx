import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Shops({ shops }) {
    return (
        <StorefrontLayout>
            <Head title="Shops" />
            <section className="mx-auto max-w-7xl px-4 py-6 lg:px-10">
                <h1 className="font-display text-3xl font-extrabold">Shops</h1>
                {shops.length === 0 ? (
                    <p className="mt-4 text-sm text-on-surface-variant">No shops are open yet.</p>
                ) : (
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {shops.map((shop) => (
                            <Link key={shop.slug} href={route('shops.show', shop.slug)} className="card-surface p-5">
                                <div className="font-display text-lg font-bold text-primary">{shop.name}</div>
                                <p className="mt-1 text-sm text-on-surface-variant">{[shop.city, shop.state].filter(Boolean).join(', ') || 'Nigeria'}</p>
                                <p className="mt-3 text-sm">{shop.products} product{shop.products === 1 ? '' : 's'}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </StorefrontLayout>
    );
}
