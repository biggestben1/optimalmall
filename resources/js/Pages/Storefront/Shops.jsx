import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

function place(shop) {
    return [shop.city, shop.state].filter(Boolean).join(', ') || 'Nigeria';
}

export default function Shops({ shops }) {
    const [search, setSearch] = useState('');
    const query = search.trim().toLowerCase();
    const visible = shops.filter((shop) => {
        if (query === '') {
            return true;
        }

        return `${shop.name} ${place(shop)} ${shop.description || ''}`.toLowerCase().includes(query);
    });

    return (
        <StorefrontLayout>
            <Head title="Shops" />
            <section className="px-4 py-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary lg:p-8">
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Marketplace</div>
                        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight lg:text-4xl">Shops on OptimalMall</h1>
                        <p className="mt-2 max-w-2xl text-sm text-primary-fixed">
                            {shops.length} verified seller{shops.length === 1 ? '' : 's'} across phones, fashion, groceries, and home.
                        </p>
                    </section>

                    <form className="mt-6" onSubmit={(event) => event.preventDefault()}>
                        <label className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 shadow-sm">
                            <span className="material-symbols-outlined text-[20px] text-outline">search</span>
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search shop, city, or what they sell..."
                                className="w-full border-0 bg-transparent text-sm placeholder:text-outline focus:ring-0"
                                aria-label="Search shops"
                                autoComplete="off"
                            />
                        </label>
                    </form>

                    {visible.length === 0 ? (
                        <div className="card-surface mt-6 px-5 py-10 text-center">
                            <span className="material-symbols-outlined text-[36px] text-primary">storefront</span>
                            <p className="mt-2 font-display text-xl font-bold">{shops.length === 0 ? 'No shops are open yet' : 'No shops match that search'}</p>
                            <p className="mt-1 text-sm text-on-surface-variant">
                                {shops.length === 0 ? 'Verified sellers will show here when a shop is active.' : 'Try the shop name or a city such as Lagos.'}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visible.map((shop) => (
                                <Link key={shop.slug} href={route('shops.show', shop.slug)} className="card-surface flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                                    <span className="flex items-center gap-3">
                                        {shop.logo_url ? (
                                            <img src={shop.logo_url} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                                        ) : (
                                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-on-primary">
                                                {shop.name.slice(0, 1)}
                                            </span>
                                        )}
                                        <span>
                                            <span className="block font-display text-lg font-bold text-primary">{shop.name}</span>
                                            <span className="text-sm text-on-surface-variant">{place(shop)}</span>
                                        </span>
                                    </span>
                                    {shop.description && <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant">{shop.description}</p>}
                                    <span className="mt-4 flex items-center justify-between text-sm font-bold">
                                        <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface">{shop.products} product{shop.products === 1 ? '' : 's'}</span>
                                        <span className="inline-flex items-center gap-1 text-primary">
                                            Visit shop
                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </StorefrontLayout>
    );
}
