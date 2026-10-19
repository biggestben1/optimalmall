import { Head } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import FilterBar from '../../../Components/Admin/FilterBar';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ logs, filters }) {
    return (
        <AdminLayout title="Insights" heading="Audit log">
            <Head title="Audit log" />
            <p className="mb-4 text-sm text-on-surface-variant">Critical marketplace actions, including payouts, refunds, approvals, and settings.</p>
            <FilterBar action={route('admin.audit.index')} filters={filters} placeholder="Action, for example payout.released" />
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">When</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Actor</th>
                            <th className="px-4 py-3">Seller</th>
                            <th className="px-4 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {logs.data.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No audit entries yet.</td></tr>
                        ) : logs.data.map((log) => (
                            <tr key={log.id}>
                                <td className="px-4 py-3">{log.created_at}</td>
                                <td className="px-4 py-3 font-semibold">{log.action}</td>
                                <td className="px-4 py-3">{log.actor}</td>
                                <td className="px-4 py-3">{log.vendor || '—'}</td>
                                <td className="px-4 py-3 text-xs text-on-surface-variant">{log.properties ? JSON.stringify(log.properties) : log.ip_address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={logs.links} />
        </AdminLayout>
    );
}
