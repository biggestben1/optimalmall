import { Head, Link, router, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Cart({ lines, summary, quote }) {
    const coupon = useForm({ code: quote.coupon || '' });
    return (
        <StorefrontLayout>
            <Head title="Cart" />
            <section className="mx-auto max-w-4xl px-4 py-6 lg:px-10">
                <h1 className="font-display text-3xl font-extrabold">Cart</h1>
                {lines.length === 0 ? (
                    <div className="card-surface mt-6 p-6">
                        <p className="text-sm text-on-surface-variant">Your cart is empty.</p>
                        <Link href={route('products.index')} className="btn-primary mt-4 inline-flex">Browse products</Link>
                    </div>
                ) : (
                    <div className="mt-6 space-y-4">
                        {lines.map((line) => (
                            <article key={line.id} className="card-surface flex flex-wrap items-center gap-4 p-4">
                                {line.image_url ? (
                                    <img src={line.image_url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-surface-container-low text-xs text-outline">No image</div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <Link href={route('products.show', line.slug)} className="font-display font-bold text-primary">{line.title}</Link>
                                    {line.vendor && <p className="text-sm text-on-surface-variant">{line.vendor}</p>}
                                    <p className="text-sm">{line.price_label}</p>
                                </div>
                                <input
                                    className="w-20 rounded-xl border border-surface-container px-3 py-2 text-sm"
                                    type="number"
                                    min="1"
                                    max={line.stock}
                                    defaultValue={line.quantity}
                                    onBlur={(event) => {
                                        const quantity = Number(event.target.value);
                                        if (quantity !== line.quantity) {
                                            router.patch(route('cart.update', line.slug), { quantity }, { preserveScroll: true });
                                        }
                                    }}
                                />
                                <div className="w-28 text-right font-display text-lg font-extrabold">{line.line_total_label}</div>
                                <button type="button" className="text-sm font-bold text-secondary" onClick={() => router.delete(route('cart.destroy', line.slug), { preserveScroll: true })}>Remove</button>
                            </article>
                        ))}
                        <div className="card-surface space-y-3 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-on-surface-variant">{summary.count} item{summary.count === 1 ? '' : 's'}</span>
                                <span>{quote.subtotal_label}</span>
                            </div>
                            {quote.discount_label && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-on-surface-variant">Coupon {quote.coupon}</span>
                                    <span>-{quote.discount_label}</span>
                                </div>
                            )}
                            <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); coupon.post(route('checkout.coupon'), { preserveScroll: true }); }}>
                                <input className="rounded-xl border border-surface-container px-3 py-2 text-sm" value={coupon.data.code} onChange={(event) => coupon.setData('code', event.target.value)} placeholder="Coupon code" />
                                <button className="rounded-xl border border-surface-container px-3 py-2 text-sm font-bold" disabled={coupon.processing}>Apply</button>
                                {quote.coupon && <button type="button" className="text-sm font-bold text-secondary" onClick={() => router.delete(route('checkout.coupon.destroy'), { preserveScroll: true })}>Remove</button>}
                            </form>
                            {coupon.errors.code && <p className="text-sm text-red-700">{coupon.errors.code}</p>}
                            {quote.coupon_message && <p className="text-sm text-red-700">{quote.coupon_message}</p>}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-on-surface-variant">Delivery</span>
                                <span>{quote.shipping_label}</span>
                            </div>
                            {quote.free_delivery && <p className="text-sm text-on-surface-variant">Free delivery on orders from ₦100,000.</p>}
                            {!quote.free_delivery && <p className="text-sm text-on-surface-variant">Delivery is free from ₦100,000.</p>}
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="font-display text-2xl font-extrabold text-primary">{quote.total_label}</span>
                            </div>
                            <Link href={route('checkout.create')} className="btn-accent inline-flex">Checkout</Link>
                        </div>
                    </div>
                )}
            </section>
        </StorefrontLayout>
    );
}
