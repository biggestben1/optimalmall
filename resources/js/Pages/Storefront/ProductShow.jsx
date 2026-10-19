import { Head, Link, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/ProductCard';

export default function ProductShow({ product, related }) {
    const form = useForm({ quantity: 1 });

    return (
        <StorefrontLayout>
            <Head title={product.title} />
            <section className="px-4 py-6 lg:px-10">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
                    <div className="card-surface overflow-hidden">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="aspect-square w-full object-cover" />
                        ) : (
                            <div className="flex aspect-square items-center justify-center bg-surface-container-low text-outline">No image</div>
                        )}
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{product.category?.name}</div>
                        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">{product.title}</h1>
                        <div className="mt-2 text-sm text-on-surface-variant">
                            Sold by <span className="font-semibold text-primary">{product.vendor?.name}</span>
                            {product.vendor?.city && <> · {product.vendor.city}, {product.vendor.state}</>}
                        </div>
                        <div className="mt-6 flex items-baseline gap-3">
                            <div className="font-display text-3xl font-extrabold text-primary">{product.formatted_price}</div>
                            {product.compare_at_price != null && (
                                <div className="text-lg text-outline line-through">₦{Number(product.compare_at_price).toLocaleString()}</div>
                            )}
                        </div>
                        <div className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${product.in_stock ? 'bg-tertiary-fixed text-tertiary' : 'bg-red-100 text-red-700'}`}>
                            {product.in_stock ? `${product.stock} in stock` : 'Out of stock'}
                        </div>
                        <p className="mt-6 text-sm leading-relaxed text-on-surface-variant">{product.description}</p>
                        <form className="mt-8 flex flex-wrap items-center gap-3" onSubmit={(event) => { event.preventDefault(); form.post(route('cart.store', product.slug)); }}>
                            <input
                                className="w-20 rounded-xl border border-surface-container px-3 py-2 text-sm"
                                type="number"
                                min="1"
                                max={product.stock}
                                value={form.data.quantity}
                                disabled={!product.in_stock}
                                onChange={(event) => form.setData('quantity', event.target.value)}
                            />
                            <button className="btn-accent disabled:opacity-60" disabled={!product.in_stock || form.processing}>
                                {product.in_stock ? 'Add to cart' : 'Out of stock'}
                            </button>
                            {product.category && (
                                <Link href={route('products.index', { category: product.category.id })} className="btn-primary">More in category</Link>
                            )}
                            {form.errors.quantity && <p className="w-full text-sm text-red-700">{form.errors.quantity}</p>}
                        </form>
                        <div className="mt-8 rounded-xl bg-surface-container-low p-4 text-sm">
                            <div className="font-display font-bold text-primary">OptimalMall Escrow Protection</div>
                            <p className="mt-1 text-on-surface-variant">Payments and delivery tracking will be enabled in Phase 2.</p>
                        </div>
                    </div>
                </div>

                {related?.length > 0 && (
                    <div className="mx-auto mt-12 max-w-7xl">
                        <h2 className="mb-4 font-display text-xl font-bold">Related products</h2>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {related.map((item) => <ProductCard key={item.id} product={item} />)}
                        </div>
                    </div>
                )}
            </section>
        </StorefrontLayout>
    );
}
