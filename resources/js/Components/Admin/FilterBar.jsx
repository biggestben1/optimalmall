import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function FilterBar({ action, filters = {}, placeholder = 'Search', children }) {
    const formRef = useRef(null);
    const timer = useRef(null);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    function visit(form) {
        const query = Object.fromEntries(new FormData(form).entries());
        if (typeof query.search === 'string') {
            query.search = query.search.trim();
        }
        router.get(action, query, { preserveState: true, preserveScroll: true, replace: true });
    }

    function submit(event) {
        event.preventDefault();
        window.clearTimeout(timer.current);
        visit(event.currentTarget);
    }

    function onInput(event) {
        if (event.target.name !== 'search') {
            return;
        }

        window.clearTimeout(timer.current);
        const form = event.currentTarget;
        timer.current = window.setTimeout(() => visit(form), 300);
    }

    function onChange(event) {
        if (event.target.name === 'search') {
            return;
        }

        window.clearTimeout(timer.current);
        visit(event.currentTarget);
    }

    return (
        <form ref={formRef} onSubmit={submit} onInput={onInput} onChange={onChange} className="mb-4 flex flex-wrap items-center gap-2">
            <input
                name="search"
                defaultValue={filters.search ?? ''}
                placeholder={placeholder}
                className="min-w-48 flex-1 rounded-xl border-outline-variant"
                autoComplete="off"
                aria-label={placeholder}
            />
            {children}
            <button type="submit" className="btn-primary">Apply</button>
        </form>
    );
}
