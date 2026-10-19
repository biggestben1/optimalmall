import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function SearchForm({ action, children }) {
    const timer = useRef(null);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    function visit(form) {
        const data = new FormData(form);
        const query = Object.fromEntries([...data.entries()].filter(([, value]) => value !== '' && value !== '0'));
        if (typeof query.q === 'string') {
            query.q = query.q.trim();
        }
        router.get(action, query, { preserveState: true, preserveScroll: true, replace: true });
    }

    function submit(event) {
        event.preventDefault();
        window.clearTimeout(timer.current);
        visit(event.currentTarget);
    }

    function onInput(event) {
        if (event.target.name !== 'q') {
            return;
        }

        window.clearTimeout(timer.current);
        const form = event.currentTarget;
        timer.current = window.setTimeout(() => visit(form), 300);
    }

    function onChange(event) {
        if (event.target.name === 'q') {
            return;
        }

        window.clearTimeout(timer.current);
        visit(event.currentTarget);
    }

    return (
        <form onSubmit={submit} onInput={onInput} onChange={onChange} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
