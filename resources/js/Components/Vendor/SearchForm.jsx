import { router } from '@inertiajs/react';

export default function SearchForm({ action, values = {}, children }) {
    function submit(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const query = Object.fromEntries([...form.entries()].filter(([, value]) => value !== '' && value !== '0'));
        router.get(action, query, { preserveState: true, replace: true });
    }

    return (
        <form onSubmit={submit} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {children}
            <div className="flex items-end gap-2">
                <button type="submit" className="btn-primary">Search</button>
                <button
                    type="button"
                    className="px-3 py-2 text-sm font-bold text-on-surface-variant"
                    onClick={() => router.get(action)}
                >
                    Reset
                </button>
            </div>
        </form>
    );
}
