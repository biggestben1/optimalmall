import { Head, Link } from '@inertiajs/react';
import ProductCard from '../../Components/ProductCard';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Shop({ shop, products }) {
    return (
        <StorefrontLayout>
            <Head title={shop.name} />
            <section className="mx-auto max-w-7xl px-4 py-6 lg:px-10">
                <h1 className="font-display text-3xl font-extrabold">{shop.name}</h1>
                <p className="mt-1 text-sm text-on-surface-variant">{[shop.city, shop.state].filter(Boolean).join(', ')}</p>
                {shop.description && <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">{shop.description}</p>}
                <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {products.data.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
                {products.data.length === 0 && <p className="mt-6 text-sm text-on-surface-variant">This shop has no products listed.</p>}
                <div className="mt-6 flex flex-wrap gap-2">
                    {products.links?.map((link, index) => (
                        <Link key={index} href={link.url || '#'} className={`rounded-lg px-3 py-1 text-sm ${link.active ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ))}
                </div>
            </section>
        </StorefrontLayout>
    );
}
