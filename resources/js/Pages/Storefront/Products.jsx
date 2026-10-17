import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/ProductCard';

export default function Products({ categories, products, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [sort, setSort] = useState(filters.sort || 'newest');
    const [min, setMin] = useState(filters.min || '');
    const [max, setMax] = useState(filters.max || '');

    useEffect(() => {
        setSearch(filters.search || '');
        setCategory(filters.category || '');
        setSort(filters.sort || 'newest');
        setMin(filters.min || '');
        setMax(filters.max || '');
    }, [filters.search, filters.category, filters.sort, filters.min, filters.max]);

    const apply = (overrides = {}) => {
        const nextSearch = overrides.search ?? search;
        const nextCategory = overrides.category ?? category;
        const nextSort = overrides.sort ?? sort;
        const nextMin = overrides.min ?? min;
        const nextMax = overrides.max ?? max;

        router.get(route('products.index'), {
            search: nextSearch || undefined,
            category: nextCategory || undefined,
            sort: nextSort || 'newest',
            min: nextMin || undefined,
            max: nextMax || undefined,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    useEffect(() => {
        if ((search || '') === (filters.search || '')) {
            return;
        }

        const timer = window.setTimeout(() => apply({ search }), 300);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const clear = () => {
        setSearch('');
        setCategory('');
        setSort('newest');
        setMin('');
        setMax('');
        router.get(route('products.index'));
    };

    return (
        <StorefrontLayout>
            <Head title="Products" />
            <section className="px-4 py-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6">
                        <div className="text-xs font-bold uppercase tracking-wide text-secondary">Catalogue</div>
                        <h1 className="font-display text-3xl font-extrabold tracking-tight">
                            {filters.search
                                ? `Results for “${filters.search}”`
                                : 'Phones, Tablets & Gadgets in Nigeria'}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
                            {filters.search
                                ? `${products.total} product${products.total === 1 ? '' : 's'} matched your search across verified OptimalMall sellers.`
                                : 'Search, filter and compare prices across verified OptimalMall sellers.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <aside className="card-surface h-fit p-4 lg:col-span-3">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-display text-sm font-bold">Filters</h2>
                                <button type="button" onClick={clear} className="text-xs font-bold text-primary">Clear</button>
                            </div>

                            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Search</label>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && apply()}
                                className="mb-4 w-full rounded-xl border-outline-variant bg-surface-container-low text-sm focus:border-primary focus:ring-primary"
                                placeholder="Search products..."
                                autoComplete="off"
                            />

                            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Category</label>
                            <select
                                value={category || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCategory(value);
                                    apply({ category: value });
                                }}
                                className="mb-4 w-full rounded-xl border-outline-variant bg-surface-container-low text-sm focus:border-primary focus:ring-primary"
                            >
                                <option value="">All categories</option>
                                {categories.map((cat) => (
                                    <optgroup key={cat.id} label={cat.name}>
                                        <option value={cat.id}>{cat.name}</option>
                                        {cat.children?.map((child) => (
                                            <option key={child.id} value={child.id}>— {child.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>

                            <div className="mb-4 grid grid-cols-2 gap-2">
                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Min ₦</label>
                                    <input type="number" value={min} onChange={(e) => setMin(e.target.value)} onBlur={() => apply()} className="w-full rounded-xl border-outline-variant bg-surface-container-low text-sm focus:border-primary focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Max ₦</label>
                                    <input type="number" value={max} onChange={(e) => setMax(e.target.value)} onBlur={() => apply()} className="w-full rounded-xl border-outline-variant bg-surface-container-low text-sm focus:border-primary focus:ring-primary" />
                                </div>
                            </div>

                            <label className="mb-1 block text-xs font-bold uppercase text-on-surface-variant">Sort</label>
                            <select
                                value={sort}
                                onChange={(e) => {
                                    setSort(e.target.value);
                                    apply({ sort: e.target.value });
                                }}
                                className="w-full rounded-xl border-outline-variant bg-surface-container-low text-sm focus:border-primary focus:ring-primary"
                            >
                                <option value="newest">Newest</option>
                                <option value="featured">Featured</option>
                                <option value="price_asc">Price: low to high</option>
                                <option value="price_desc">Price: high to low</option>
                            </select>
                        </aside>

                        <div className="lg:col-span-9">
                            <div className="mb-4 text-sm text-on-surface-variant">{products.total} products</div>
                            {products.data.length === 0 ? (
                                <div className="card-surface p-10 text-center text-on-surface-variant">No products match your filters.</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                        {products.data.map((product) => <ProductCard key={product.id} product={product} />)}
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {products.links?.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                preserveState
                                                className={`rounded-lg px-3 py-1 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
