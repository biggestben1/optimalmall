import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (!links?.length || links.length <= 3) {
        return null;
    }

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link, index) => (
                <Link
                    key={index}
                    href={link.url || '#'}
                    preserveScroll
                    className={`rounded-lg px-3 py-1 text-sm ${
                        link.active
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-lowest text-on-surface'
                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
