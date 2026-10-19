import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '../Components/ApplicationLogo';
import HeaderSearch from '../Components/HeaderSearch';

export default function StorefrontLayout({ children }) {
    const { auth, navCategories = [], flash, cart } = usePage().props;
    const { url } = usePage();
    const firstName = auth.user?.name?.split(' ')[0] || 'Guest';
    const query = url.includes('?') ? url.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const activeCategoryId = params.get('category') || '';
    const onProducts = url.split('?')[0] === '/products';
    const allCategoriesActive = onProducts && !activeCategoryId;

    return (
        <div className="min-h-screen bg-background font-sans text-on-surface antialiased">
            <header className="fixed inset-x-0 top-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
                <div className="bg-primary text-on-primary">
                    <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs lg:px-10">
                        <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">local_shipping</span>
                                Free Lagos Delivery on orders over ₦100k
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline">NGN (₦)</span>
                            <span className="rounded bg-tertiary-fixed-dim px-1.5 py-0.5 text-[10px] font-bold text-tertiary">NG</span>
                        </div>
                    </div>
                </div>

                <div className="mx-auto flex h-[75px] max-w-7xl items-center gap-4 px-4 lg:px-10">
                    <ApplicationLogo />

                    <HeaderSearch className="hidden min-w-0 flex-1 md:flex" />

                    <div className="ml-auto flex items-center gap-2 lg:gap-4">
                        {auth.user ? (
                            <Link
                                href={auth.user.is_super_admin ? route('admin.dashboard') : route('dashboard')}
                                className="hidden items-center gap-2 rounded-xl px-2 py-1 hover:bg-surface-container-low lg:flex"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] text-on-surface-variant">Hello, {firstName}</div>
                                    <div className="text-sm font-bold">Account</div>
                                </div>
                            </Link>
                        ) : (
                            <Link href={route('login')} className="hidden items-center gap-2 rounded-xl px-2 py-1 hover:bg-surface-container-low lg:flex">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                </div>
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] text-on-surface-variant">Hello, Guest</div>
                                    <div className="text-sm font-bold">Sign in</div>
                                </div>
                            </Link>
                        )}

                        <button type="button" className="relative p-1 text-on-surface-variant opacity-60" title="Wishlist coming in Phase 2" disabled>
                            <span className="material-symbols-outlined text-[24px]">favorite</span>
                        </button>
                        <Link href={route('cart.index')} className="relative flex items-center gap-2 rounded-xl bg-primary-container px-3 py-1.5 text-on-primary">
                            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                            {cart?.count > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary">{cart.count}</span>
                            )}
                            <div className="hidden text-left leading-tight sm:block">
                                <div className="text-[10px] text-primary-fixed">{cart?.total_label ?? '₦0'}</div>
                                <div className="text-sm font-bold">Cart</div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="border-t border-surface-container px-4 py-2 md:hidden lg:px-10">
                    <div className="mx-auto max-w-7xl">
                        <HeaderSearch className="flex w-full" />
                    </div>
                </div>

                <div className="border-t border-surface-container bg-surface-container-low">
                    <div className="mx-auto flex h-11 max-w-7xl items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:px-10 [&::-webkit-scrollbar]:hidden">
                        <Link
                            href={route('products.index')}
                            className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                allCategoriesActive
                                    ? 'bg-primary text-on-primary'
                                    : 'bg-surface-container-highest text-on-surface hover:bg-primary hover:text-on-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">menu</span> All Categories
                        </Link>
                        {navCategories.map((category) => {
                            const isActive = String(category.id) === String(activeCategoryId);

                            return (
                                <Link
                                    key={category.id}
                                    href={route('products.index', { category: category.id })}
                                    className={`shrink-0 rounded-lg px-2 py-1 text-sm transition ${
                                        isActive
                                            ? 'bg-surface-container font-bold text-primary'
                                            : 'text-on-surface-variant hover:text-primary'
                                    }`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {category.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            <main className="min-h-screen pt-[14.5rem] md:pt-[10.5rem] lg:pt-40">
                {flash?.status && (
                    <div className="mx-auto max-w-7xl px-4 py-3 lg:px-10">
                        <div className="rounded-xl bg-tertiary-fixed px-4 py-3 text-sm font-semibold text-tertiary">{flash.status}</div>
                    </div>
                )}
                {children}
            </main>

            <footer className="mt-16 border-t border-surface-container bg-primary text-on-primary">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 lg:px-10">
                    <div>
                        <ApplicationLogo href={false} showTagline={false} inverted />
                        <p className="mt-2 text-sm text-primary-fixed">Shop Smart. Live Better. Nigeria’s modern multi-vendor mall.</p>
                    </div>
                    <div>
                        <div className="font-display text-sm font-bold">Shop</div>
                        <ul className="mt-3 space-y-2 text-sm text-primary-fixed">
                            <li><Link href={route('products.index')} className="hover:text-white">All products</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-display text-sm font-bold">Account</div>
                        <ul className="mt-3 space-y-2 text-sm text-primary-fixed">
                            <li><Link href={route('login')} className="hover:text-white">Sign in</Link></li>
                            <li><Link href={route('register')} className="hover:text-white">Create account</Link></li>
                        </ul>
                    </div>
                    <div>
                        <div className="font-display text-sm font-bold">Support</div>
                        <p className="mt-3 text-sm text-primary-fixed">+234 800-OPTIMAL<br />hello@optimalmall.ng</p>
                    </div>
                </div>
                <div className="border-t border-white/10 py-4 text-center text-xs text-primary-fixed">© {new Date().getFullYear()} OptimalMall</div>
            </footer>
        </div>
    );
}
