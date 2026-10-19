import { Head, router } from '@inertiajs/react';
import VendorLayout from '../../../Layouts/VendorLayout';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ notifications }) {
    return (
        <VendorLayout title="Account" heading="Notifications">
            <Head title="Notifications" />
            <div className="mb-4 flex justify-end">
                <button type="button" className="btn-primary" onClick={() => router.post(route('vendor.notifications.read'))}>Mark all read</button>
            </div>
            <div className="space-y-3">
                {notifications.data.length === 0 ? (
                    <div className="card-surface px-4 py-8 text-center text-sm text-on-surface-variant">No notifications yet.</div>
                ) : notifications.data.map((note) => (
                    <article key={note.id} className="card-surface p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-semibold">{note.title}</h2>
                            <span className="text-xs text-on-surface-variant">{note.read ? 'Read' : 'New'} · {note.created_at}</span>
                        </div>
                        <p className="mt-1 text-sm text-on-surface-variant">{note.body}</p>
                    </article>
                ))}
            </div>
            <Pagination links={notifications.links} />
        </VendorLayout>
    );
}
