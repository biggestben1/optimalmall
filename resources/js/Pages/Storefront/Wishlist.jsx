import { Head, Link, router } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Wishlist({ lines }) {
    return (
        <StorefrontLayout>
            <Head title="Wishlist" />
            <section className="mx-auto max-w-4xl px-4 py-6 lg:px-10">
                <h1 className="font-display text-3xl font-extrabold">Wishlist</h1>
                {lines.length === 0 ? (
                    <p className="mt-4 text-sm text-on-surface-variant">Save products with the heart or Save button. They stay on this browser.</p>
                ) : (
                    <div className="mt-6 space-y-3">
                        {lines.map((line) => (
                            <article key={line.id} className="card-surface flex items-center gap-4 p-4">
                                {line.image_url ? <img src={line.image_url} alt="" className="h-16 w-16 rounded-lg object-cover" /> : <div className="h-16 w-16 rounded-lg bg-surface-container-low" />}
                                <div className="min-w-0 flex-1">
                                    <Link href={route('products.show', line.slug)} className="font-display font-bold text-primary">{line.title}</Link>
                                    <p className="text-sm text-on-surface-variant">{line.vendor} · {line.in_stock ? line.formatted_price : 'Out of stock'}</p>
                                </div>
                                <button type="button" className="text-sm font-bold text-secondary" onClick={() => router.post(route('wishlist.toggle', line.slug), {}, { preserveScroll: true })}>Remove</button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </StorefrontLayout>
    );
}
