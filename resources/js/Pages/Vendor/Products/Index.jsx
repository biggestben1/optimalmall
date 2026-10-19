import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import VendorLayout from '../../../Layouts/VendorLayout';
import DeleteButton from '../../../Components/Admin/DeleteButton';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ products, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [approval, setApproval] = useState(filters.approval || '');

    useEffect(() => {
        setSearch(filters.search || '');
        setStatus(filters.status || '');
        setApproval(filters.approval || '');
    }, [filters.search, filters.status, filters.approval]);

    const apply = (overrides = {}) => {
        const nextSearch = (overrides.search ?? search).trim();
        const nextStatus = overrides.status ?? status;
        const nextApproval = overrides.approval ?? approval;

        router.get(route('vendor.products.index'), {
            search: nextSearch || undefined,
            status: nextStatus || undefined,
            approval: nextApproval || undefined,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    useEffect(() => {
        if ((search || '') === (filters.search || '')) {
            return undefined;
        }

        const timer = window.setTimeout(() => apply({ search }), 300);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const clear = () => {
        setSearch('');
        setStatus('');
        setApproval('');
        router.get(route('vendor.products.index'));
    };

    const resultLabel = filters.search
        ? `${products.total} product${products.total === 1 ? '' : 's'} matched “${filters.search}”`
        : `${products.total} product${products.total === 1 ? '' : 's'} in your shop`;

    return (
        <VendorLayout title="Catalogue" heading="Products">
            <Head title="Products" />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-on-surface-variant">{resultLabel}</p>
                <Link href={route('vendor.products.create')} className="btn-primary">Add product</Link>
            </div>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    apply();
                }}
                className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center"
            >
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-surface-container-lowest px-3 py-1 shadow-sm">
                    <span className="material-symbols-outlined text-[20px] text-outline">search</span>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search title, SKU, or category..."
                        className="w-full border-0 bg-transparent text-sm placeholder:text-outline focus:ring-0"
                        aria-label="Search products"
                        autoComplete="off"
                    />
                    <button type="submit" className="btn-accent shrink-0 gap-1 px-4 py-2">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                        Search
                    </button>
                </div>
                <select
                    value={status}
                    onChange={(event) => {
                        const value = event.target.value;
                        setStatus(value);
                        apply({ status: value });
                    }}
                    className="rounded-xl border-outline-variant bg-surface-container-lowest text-sm"
                    aria-label="Status"
                >
                    <option value="">Any status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
                <select
                    value={approval}
                    onChange={(event) => {
                        const value = event.target.value;
                        setApproval(value);
                        apply({ approval: value });
                    }}
                    className="rounded-xl border-outline-variant bg-surface-container-lowest text-sm"
                    aria-label="Approval"
                >
                    <option value="">Any approval</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                {(filters.search || filters.status || filters.approval) && (
                    <button type="button" onClick={clear} className="text-sm font-bold text-primary">Clear</button>
                )}
            </form>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Approval</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {products.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No products match this search.</td></tr>
                        ) : products.data.map((product) => (
                            <tr key={product.id}>
                                <td className="px-4 py-3 font-semibold">{product.title}</td>
                                <td className="px-4 py-3">{product.formatted_price}</td>
                                <td className="px-4 py-3">{product.stock}</td>
                                <td className="px-4 py-3">{product.status_label}</td>
                                <td className="px-4 py-3">{product.approval_label}</td>
                                <td className="space-x-3 px-4 py-3 text-right">
                                    <Link href={route('vendor.products.edit', product.id)} className="font-bold text-primary">Edit</Link>
                                    <DeleteButton href={route('vendor.products.destroy', product.id)} confirmMessage="Delete this product?" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={products.links} />
        </VendorLayout>
    );
}
