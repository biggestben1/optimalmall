import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function queryFromUrl(url) {
    const query = url.includes('?') ? url.split('?')[1] : '';
    const params = new URLSearchParams(query);

    return {
        search: params.get('search') || '',
        category: params.get('category') || '',
    };
}

function visitCatalogue({ search, category, replace = true }) {
    router.get(
        route('products.index'),
        {
            search: search || undefined,
            category: category || undefined,
        },
        {
            preserveState: true,
            preserveScroll: true,
            replace,
        },
    );
}

export default function HeaderSearch({ className = '' }) {
    const page = usePage();
    const { url } = page;
    const navCategories = page.props.navCategories ?? [];
    const initial = queryFromUrl(url);
    const [search, setSearch] = useState(initial.search);
    const [category, setCategory] = useState(initial.category);
    const skipUrlSync = useRef(false);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (skipUrlSync.current) {
            skipUrlSync.current = false;

            return;
        }

        const next = queryFromUrl(url);
        setSearch(next.search);
        setCategory(next.category);
    }, [url]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const trimmed = search.trim();
        const current = queryFromUrl(url);
        const onProducts = url.split('?')[0] === '/products';

        if (trimmed === current.search && String(category || '') === String(current.category || '')) {
            return;
        }

        if (!onProducts && trimmed === '' && !category) {
            return;
        }

        const timer = window.setTimeout(() => {
            skipUrlSync.current = true;
            visitCatalogue({ search: trimmed, category });
        }, 300);

        return () => window.clearTimeout(timer);
    }, [search, category, url]);

    const submit = (event) => {
        event.preventDefault();
        skipUrlSync.current = true;
        visitCatalogue({
            search: search.trim(),
            category,
            replace: false,
        });
    };

    return (
        <form onSubmit={submit} className={`flex items-center rounded-full bg-surface-container-low py-1 pl-3 pr-1.5 ${className}`}>
            <div className="relative hidden shrink-0 items-center pr-2 sm:flex">
                <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="appearance-none border-0 bg-transparent py-1 pl-1 pr-6 text-xs font-semibold text-on-surface focus:ring-0"
                    aria-label="Search category"
                >
                    <option value="">All Categories</option>
                    {navCategories.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-0 text-[16px] text-on-surface-variant">
                    expand_more
                </span>
            </div>

            <div className="mx-1 hidden h-5 w-px bg-outline-variant sm:block" />

            <div className="flex min-w-0 flex-1 items-center gap-1 px-2">
                <span className="material-symbols-outlined text-[20px] text-outline">search</span>
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search authentic products, brands, stores..."
                    className="w-full min-w-0 border-0 bg-transparent text-sm placeholder:text-outline focus:ring-0"
                    aria-label="Search products"
                    autoComplete="off"
                />
            </div>

            <button type="submit" className="btn-accent shrink-0 gap-1 px-4 py-2">
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span className="hidden sm:inline">Search</span>
            </button>
        </form>
    );
}
