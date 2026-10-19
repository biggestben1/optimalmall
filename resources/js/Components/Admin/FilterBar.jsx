import { router } from '@inertiajs/react';

export default function FilterBar({ action, filters = {}, placeholder = 'Search', children }) {
    function submit(event) {
        event.preventDefault();
        const query = Object.fromEntries(new FormData(event.currentTarget).entries());
        router.get(action, query, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <form onSubmit={submit} className="mb-4 flex flex-wrap items-center gap-2">
            <input
                name="search"
                defaultValue={filters.search ?? ''}
                placeholder={placeholder}
                className="min-w-48 flex-1 rounded-xl border-outline-variant"
            />
            {children}
            <button type="submit" className="btn-primary">Apply</button>
        </form>
    );
}
