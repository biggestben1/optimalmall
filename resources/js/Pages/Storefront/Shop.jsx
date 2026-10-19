import { Head, Link } from '@inertiajs/react';
import Pagination from '../../Components/Admin/Pagination';
import ProductCard from '../../Components/ProductCard';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Shop({ shop, products }) {
    const place = [shop.city, shop.state].filter(Boolean).join(', ');

    return (
        <StorefrontLayout>
            <Head title={shop.name} />
            <section className="px-4 py-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary lg:p-8">
                        <Link href={route('shops.index')} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            All shops
                        </Link>
                        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight lg:text-4xl">{shop.name}</h1>
                        <p className="mt-2 max-w-2xl text-sm text-primary-fixed">
                            {place || 'Nigeria'} · {products.total} product{products.total === 1 ? '' : 's'}
                        </p>
                        {shop.description && <p className="mt-3 max-w-2xl text-sm text-primary-fixed">{shop.description}</p>}
                    </section>

                    {products.data.length === 0 ? (
                        <div className="card-surface mt-6 px-5 py-10 text-center">
                            <span className="material-symbols-outlined text-[36px] text-primary">inventory_2</span>
                            <p className="mt-2 font-display text-xl font-bold">No products listed yet</p>
                            <p className="mt-1 text-sm text-on-surface-variant">This shop has not published anything you can buy.</p>
                            <Link href={route('products.index')} className="btn-primary mt-4">Browse the catalogue</Link>
                        </div>
                    ) : (
                        <>
                            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                                {products.data.map((product) => <ProductCard key={product.id} product={product} />)}
                            </div>
                            <Pagination links={products.links} />
                        </>
                    )}
                </div>
            </section>
        </StorefrontLayout>
    );
}
