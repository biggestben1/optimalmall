import { Head, Link } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/ProductCard';

function Section({ title, badge, items }) {
    if (!items?.length) return null;
    return (
        <section className="px-4 py-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-secondary">{badge}</div>
                        <h2 className="font-display text-2xl font-bold">{title}</h2>
                    </div>
                    <Link href={route('products.index')} className="text-sm font-bold text-primary hover:underline">See all</Link>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {items.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            </div>
        </section>
    );
}

export default function Home({ categories, banners, featured, trending, bestSellers, seo }) {
    const hero = banners?.[0];

    return (
        <StorefrontLayout>
            <Head title={seo?.title || 'Shop Smart. Live Better.'}>
                {seo?.description ? <meta name="description" content={seo.description} head-key="description" /> : null}
            </Head>
            <section className="bg-surface-container px-4 py-2 text-xs lg:px-10">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-secondary">HOT</span>
                        <span>Lekki & Ikeja Same-Day Dispatch cutoff is 2:00 PM today!</span>
                    </div>
                </div>
            </section>

            <section className="px-4 py-4 lg:px-10">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-12">
                    <aside className="card-surface p-3 lg:col-span-3">
                        <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Browse Categories</div>
                        <div className="space-y-0.5">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={route('products.index', { category: category.id })}
                                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-surface-container-low"
                                >
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                                        <span className="material-symbols-outlined text-[20px] text-primary">{category.icon || 'category'}</span>
                                        {category.name}
                                    </span>
                                    <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                                </Link>
                            ))}
                        </div>
                    </aside>

                    <div className="lg:col-span-6">
                        <div className="card-surface relative min-h-[280px] overflow-hidden bg-primary text-on-primary lg:min-h-full">
                            {hero?.image_url && (
                                <img src={hero.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                            )}
                            <div className="relative flex h-full flex-col justify-end gap-3 p-6 lg:p-8">
                                <span className="w-fit rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold uppercase text-on-secondary">Mega Mall Days</span>
                                <h1 className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl">{hero?.title || 'SUPER MEGA MALL DAYS'}</h1>
                                <p className="max-w-md text-sm text-primary-fixed">{hero?.subtitle || 'Discover deals across phones, fashion, electronics and more.'}</p>
                                <Link href={hero?.link_url || route('products.index')} className="btn-accent w-fit">{hero?.cta_label || 'Shop now'}</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:col-span-3">
                        <div className="card-surface flex flex-1 flex-col justify-between bg-gradient-to-br from-primary to-primary-container p-5 text-on-primary">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-tertiary-fixed">Sell on OptimalMall</div>
                                <h2 className="mt-2 font-display text-xl font-bold">Sell to Ready Shoppers</h2>
                                <p className="mt-2 text-sm text-primary-fixed">Vendor onboarding arrives in Phase 3.</p>
                            </div>
                            <span className="mt-4 inline-flex w-fit rounded-lg bg-white/15 px-3 py-2 text-sm font-bold">Coming soon</span>
                        </div>
                        <div className="card-surface flex flex-1 flex-col justify-between p-5">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-secondary">Escrow Protection</div>
                                <h2 className="mt-2 font-display text-lg font-bold">Pay securely in Naira</h2>
                                <p className="mt-2 text-sm text-on-surface-variant">Paystack checkout lands in Phase 2.</p>
                            </div>
                            <Link href={route('products.index')} className="btn-primary mt-4 w-fit">Browse catalogue</Link>
                        </div>
                    </div>
                </div>
            </section>

            <Section title="Mega Flash Deals" badge="Featured" items={featured} />
            <Section title="Trending in Lagos & Abuja" badge="Trending" items={trending} />
            <Section title="Official Brand Flagships" badge="Best sellers" items={bestSellers} />
        </StorefrontLayout>
    );
}
