import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';

const statusTone = {
    Pending: 'bg-secondary-container text-on-secondary',
    Paid: 'bg-primary-container text-on-primary',
    Processing: 'bg-tertiary-fixed text-tertiary',
    Shipped: 'bg-primary text-on-primary',
    Delivered: 'bg-tertiary text-on-primary',
    Cancelled: 'bg-red-100 text-red-800',
};

function Shortcut({ href, icon, title, detail, tone }) {
    return (
        <Link href={href} className="card-surface flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </span>
            <span className="min-w-0">
                <span className="block font-display font-bold">{title}</span>
                <span className="block text-sm text-on-surface-variant">{detail}</span>
            </span>
        </Link>
    );
}

export default function Dashboard({ orders = [], order_count = 0 }) {
    const { auth, cart, wishlist } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0] || 'there';
    const isCustomer = auth.user?.role === 'customer';

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-container p-6 text-on-primary shadow-sm lg:p-8">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-tertiary-fixed">Your account</div>
                    <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight lg:text-4xl">Hello, {firstName}</h1>
                    <p className="mt-2 max-w-xl text-sm text-primary-fixed">Shop the mall, follow deliveries, and keep your wallet in one place.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href={route('products.index')} className="btn-accent">Continue shopping</Link>
                        <Link href={route('cart.index')} className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 font-display text-sm font-bold text-on-primary">
                            Cart{cart?.count > 0 ? ` · ${cart.count}` : ''}
                        </Link>
                    </div>
                </section>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Shortcut href={route('shops.index')} icon="storefront" title="Shops" detail="Browse sellers across the mall" tone="bg-primary-container text-on-primary" />
                    <Shortcut href={route('wishlist.index')} icon="favorite" title="Wishlist" detail={wishlist?.count > 0 ? `${wishlist.count} saved in this browser` : 'Save products for later'} tone="bg-secondary-container text-on-secondary" />
                    <Shortcut href={route('track.create')} icon="local_shipping" title="Track an order" detail="Use the order number and email" tone="bg-tertiary-fixed text-tertiary" />
                    {isCustomer && (
                        <>
                            <Shortcut href={route('account.orders.index')} icon="receipt_long" title="My orders" detail={order_count === 1 ? '1 order' : `${order_count} orders`} tone="bg-primary text-on-primary" />
                            <Shortcut href={route('wallet.index')} icon="account_balance_wallet" title="Wallet" detail="Balance, receipts, and payments" tone="bg-tertiary text-on-primary" />
                        </>
                    )}
                    {auth.user?.is_vendor && (
                        <Shortcut href={route('vendor.dashboard')} icon="store" title="Seller desk" detail={auth.user.shop_name || 'Open your shop'} tone="bg-primary text-on-primary" />
                    )}
                    {auth.user?.is_super_admin && (
                        <Shortcut href={route('admin.dashboard')} icon="admin_panel_settings" title="Admin" detail="Run the mall" tone="bg-primary text-on-primary" />
                    )}
                    <Shortcut href={route('help.create')} icon="support_agent" title="Help" detail="Message the mall team" tone="bg-surface-container text-primary" />
                </div>

                {isCustomer && (
                    <section className="card-surface mt-6 p-5 lg:p-6">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-secondary">Orders</div>
                                <h2 className="font-display text-2xl font-bold">Recent orders</h2>
                            </div>
                            <Link href={route('account.orders.index')} className="text-sm font-bold text-primary">See all</Link>
                        </div>
                        {orders.length === 0 ? (
                            <div className="mt-5 rounded-2xl bg-surface-container-low px-5 py-8 text-center">
                                <span className="material-symbols-outlined text-[36px] text-primary">shopping_bag</span>
                                <p className="mt-2 font-display font-bold">No orders yet</p>
                                <p className="mt-1 text-sm text-on-surface-variant">When you check out, the order shows up here with its status and total.</p>
                                <Link href={route('products.index')} className="btn-primary mt-4">Start shopping</Link>
                            </div>
                        ) : (
                            <ul className="mt-4 divide-y divide-surface-container">
                                {orders.map((order) => (
                                    <li key={order.number}>
                                        <Link href={route('account.orders.show', order.number)} className="flex flex-wrap items-center justify-between gap-3 py-4">
                                            <span>
                                                <span className="block font-display font-bold text-primary">{order.number}</span>
                                                <span className="text-sm text-on-surface-variant">{order.placed_at}</span>
                                            </span>
                                            <span className="flex items-center gap-3">
                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[order.status] || 'bg-surface-container text-on-surface'}`}>{order.status}</span>
                                                <span className="font-display text-lg font-extrabold">{order.total}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
