import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';
import ProductCard from '../../Components/ProductCard';

export default function ProductShow({ product, related, reviews = [], can_review = false }) {
    const form = useForm({ quantity: 1, buy_now: false });
    const review = useForm({ rating: 5, body: '' });
    const gallery = product.images?.length ? product.images : (product.image_url ? [product.image_url] : []);
    const [image, setImage] = useState(gallery[0] || null);
    const saved = useForm({});

    return (
        <StorefrontLayout>
            <Head title={product.title} />
            <section className="px-4 py-6 lg:px-10">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
                    <div>
                        <div className="card-surface overflow-hidden">
                            {image ? (
                                <img src={image} alt={product.title} className="aspect-square w-full object-cover" />
                            ) : (
                                <div className="flex aspect-square items-center justify-center bg-surface-container-low text-outline">No image</div>
                            )}
                        </div>
                        {gallery.length > 1 && (
                            <div className="mt-3 flex gap-2">
                                {gallery.map((src) => (
                                    <button key={src} type="button" className={`h-16 w-16 overflow-hidden rounded-lg border ${src === image ? 'border-primary' : 'border-transparent'}`} onClick={() => setImage(src)}>
                                        <img src={src} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{product.category?.name}</div>
                        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">{product.title}</h1>
                        <div className="mt-2 text-sm text-on-surface-variant">
                            Sold by {product.vendor?.slug ? (
                                <Link href={route('shops.show', product.vendor.slug)} className="font-semibold text-primary">{product.vendor.name}</Link>
                            ) : (
                                <span className="font-semibold text-primary">{product.vendor?.name}</span>
                            )}
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
                        {product.review_count > 0 && <p className="mt-3 text-sm text-on-surface-variant">{product.rating} out of 5 from {product.review_count} published review{product.review_count === 1 ? '' : 's'}</p>}
                        <form className="mt-8 flex flex-wrap items-center gap-3" onSubmit={(event) => event.preventDefault()}>
                            <input
                                className="w-20 rounded-xl border border-surface-container px-3 py-2 text-sm"
                                type="number"
                                min="1"
                                max={product.stock}
                                value={form.data.quantity}
                                disabled={!product.in_stock}
                                onChange={(event) => form.setData('quantity', event.target.value)}
                            />
                            <button type="button" className="btn-accent disabled:opacity-60" disabled={!product.in_stock || form.processing} onClick={() => { form.transform((data) => ({ ...data, buy_now: false })); form.post(route('cart.store', product.slug)); }}>
                                {product.in_stock ? 'Add to cart' : 'Out of stock'}
                            </button>
                            <button type="button" className="btn-primary disabled:opacity-60" disabled={!product.in_stock || form.processing} onClick={() => { form.transform((data) => ({ ...data, buy_now: true })); form.post(route('cart.store', product.slug)); }}>
                                Buy now
                            </button>
                            <button type="button" className="rounded-xl border border-surface-container px-3 py-2 text-sm font-bold" disabled={saved.processing} onClick={() => saved.post(route('wishlist.toggle', product.slug), { preserveScroll: true })}>
                                {product.saved ? 'Saved' : 'Save'}
                            </button>
                            {product.category && (
                                <Link href={route('products.index', { category: product.category.id })} className="btn-primary">More in category</Link>
                            )}
                            {form.errors.quantity && <p className="w-full text-sm text-red-700">{form.errors.quantity}</p>}
                        </form>
                        <div className="mt-8 rounded-xl bg-surface-container-low p-4 text-sm">
                            <div className="font-display font-bold text-primary">Delivery and payment</div>
                            <p className="mt-1 text-on-surface-variant">Pay on delivery or from your wallet. Delivery is free from ₦100,000, otherwise ₦3,500. Track an order with its number and email.</p>
                        </div>
                    </div>
                </div>

                <div className="mx-auto mt-12 max-w-7xl">
                    <h2 className="font-display text-xl font-bold">Reviews</h2>
                    {reviews.length === 0 ? (
                        <p className="mt-3 text-sm text-on-surface-variant">No published reviews yet.</p>
                    ) : (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {reviews.map((item) => (
                                <article key={`${item.author}-${item.body}`} className="card-surface p-4 text-sm">
                                    <div className="font-semibold">{item.author} · {item.rating}/5</div>
                                    <p className="mt-2 text-on-surface-variant">{item.body}</p>
                                    {item.reply && <p className="mt-2 text-primary">Seller: {item.reply}</p>}
                                </article>
                            ))}
                        </div>
                    )}
                    {can_review && (
                        <form className="card-surface mt-4 max-w-xl space-y-3 p-4" onSubmit={(event) => { event.preventDefault(); review.post(route('products.reviews.store', product.slug)); }}>
                            <div className="font-semibold">Write a review</div>
                            <label className="block text-sm">
                                Rating
                                <select className="mt-1 w-full rounded-xl border border-surface-container px-3 py-2" value={review.data.rating} onChange={(event) => review.setData('rating', event.target.value)}>
                                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </label>
                            <textarea className="w-full rounded-xl border border-surface-container px-3 py-2 text-sm" rows="3" value={review.data.body} onChange={(event) => review.setData('body', event.target.value)} placeholder="How was the product?" required />
                            {review.errors.body && <p className="text-sm text-red-700">{review.errors.body}</p>}
                            <button className="btn-primary" disabled={review.processing}>Submit review</button>
                            <p className="text-xs text-on-surface-variant">It appears on the product after the mall checks it.</p>
                        </form>
                    )}
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
