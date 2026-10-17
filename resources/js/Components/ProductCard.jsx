import { Link } from '@inertiajs/react';

export default function ProductCard({ product }) {
    return (
        <Link
            href={route('products.show', product.slug)}
            className="card-surface group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-outline">No image</div>
                )}
                {product.is_featured && (
                    <span className="absolute left-2 top-2 rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-secondary">
                        Featured
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                    {product.vendor?.name}
                </div>
                <h3 className="line-clamp-2 font-display text-sm font-semibold text-on-surface">{product.title}</h3>
                <div className="mt-auto flex items-baseline gap-2 pt-2">
                    <span className="font-display text-lg font-extrabold text-primary">{product.formatted_price}</span>
                    {product.compare_at_price != null && (
                        <span className="text-xs text-outline line-through">
                            ₦{Number(product.compare_at_price).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
