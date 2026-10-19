import { Head, Link, router, useForm } from '@inertiajs/react';
import StorefrontLayout from '../../Layouts/StorefrontLayout';

export default function Checkout({ lines, quote, wallet, customer }) {
    const coupon = useForm({ code: quote.coupon || '' });
    const form = useForm({
        customer_name: customer.name,
        customer_email: customer.email,
        shipping_address: '',
        payment_method: wallet?.covers_total ? 'wallet' : 'delivery',
    });

    return (
        <StorefrontLayout>
            <Head title="Checkout" />
            <section className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px] lg:px-10">
                <form className="card-surface space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); form.post(route('checkout.store')); }}>
                    <h1 className="font-display text-3xl font-extrabold">Checkout</h1>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Full name</span>
                        <input className="w-full rounded-xl border border-surface-container px-3 py-2" value={form.data.customer_name} onChange={(event) => form.setData('customer_name', event.target.value)} required />
                        {form.errors.customer_name && <span className="text-red-700">{form.errors.customer_name}</span>}
                    </label>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Email</span>
                        <input className="w-full rounded-xl border border-surface-container px-3 py-2" type="email" value={form.data.customer_email} onChange={(event) => form.setData('customer_email', event.target.value)} required />
                        {form.errors.customer_email && <span className="text-red-700">{form.errors.customer_email}</span>}
                    </label>
                    <label className="block text-sm">
                        <span className="mb-1 block text-on-surface-variant">Delivery address</span>
                        <textarea className="w-full rounded-xl border border-surface-container px-3 py-2" rows="3" value={form.data.shipping_address} onChange={(event) => form.setData('shipping_address', event.target.value)} required />
                        {form.errors.shipping_address && <span className="text-red-700">{form.errors.shipping_address}</span>}
                    </label>
                    <fieldset className="space-y-2 text-sm">
                        <legend className="mb-1 font-semibold">Payment</legend>
                        <label className="flex items-start gap-2">
                            <input type="radio" name="payment_method" value="delivery" checked={form.data.payment_method === 'delivery'} onChange={() => form.setData('payment_method', 'delivery')} />
                            <span>Pay on delivery. The order stays unpaid until the courier collects payment.</span>
                        </label>
                        <label className={`flex items-start gap-2 ${wallet ? '' : 'text-on-surface-variant'}`}>
                            <input type="radio" name="payment_method" value="wallet" checked={form.data.payment_method === 'wallet'} disabled={!wallet?.covers_total} onChange={() => form.setData('payment_method', 'wallet')} />
                            <span>
                                {wallet
                                    ? `Pay from wallet (${wallet.balance_label}${wallet.covers_total ? '' : ', not enough for this order'})`
                                    : 'Pay from wallet after you sign in as a customer.'}
                            </span>
                        </label>
                        {form.errors.payment_method && <p className="text-red-700">{form.errors.payment_method}</p>}
                        {form.errors.cart && <p className="text-red-700">{form.errors.cart}</p>}
                        {form.errors.code && <p className="text-red-700">{form.errors.code}</p>}
                    </fieldset>
                    <button className="btn-accent" disabled={form.processing}>Place order</button>
                </form>
                <aside className="card-surface h-fit p-5">
                    <h2 className="font-display text-lg font-bold">Your order</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        {lines.map((line) => (
                            <li key={line.id} className="flex justify-between gap-3">
                                <span>{line.quantity} × {line.title}</span>
                                <span>{line.line_total_label}</span>
                            </li>
                        ))}
                    </ul>
                    <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); coupon.post(route('checkout.coupon'), { preserveScroll: true }); }}>
                        <input className="min-w-0 flex-1 rounded-xl border border-surface-container px-3 py-2 text-sm" value={coupon.data.code} onChange={(event) => coupon.setData('code', event.target.value)} placeholder="Coupon" />
                        <button className="text-sm font-bold" disabled={coupon.processing}>Apply</button>
                    </form>
                    {coupon.errors.code && <p className="mt-1 text-sm text-red-700">{coupon.errors.code}</p>}
                    {quote.coupon_message && <p className="mt-1 text-sm text-red-700">{quote.coupon_message}</p>}
                    {quote.coupon && <button type="button" className="mt-2 text-sm font-bold text-secondary" onClick={() => router.delete(route('checkout.coupon.destroy'), { preserveScroll: true })}>Remove {quote.coupon}</button>}
                    <div className="mt-4 space-y-1 border-t border-surface-container pt-3 text-sm">
                        <div className="flex justify-between"><span>Items</span><span>{quote.subtotal_label}</span></div>
                        {quote.discount_label && <div className="flex justify-between"><span>Coupon</span><span>-{quote.discount_label}</span></div>}
                        <div className="flex justify-between"><span>Delivery</span><span>{quote.shipping_label}</span></div>
                        <div className="flex justify-between font-display text-xl font-extrabold text-primary"><span>Total</span><span>{quote.total_label}</span></div>
                    </div>
                    <Link href={route('cart.index')} className="mt-4 inline-block text-sm font-semibold text-primary">Back to cart</Link>
                </aside>
            </section>
        </StorefrontLayout>
    );
}
