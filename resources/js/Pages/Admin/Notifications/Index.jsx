import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';
import Pagination from '../../../Components/Admin/Pagination';

export default function Index({ dispatches, sms_ready }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        audience: 'vendors',
        channels: ['in_app'],
        subject: '',
        body: '',
    });

    function toggleChannel(channel) {
        setData('channels', data.channels.includes(channel)
            ? data.channels.filter((item) => item !== channel)
            : [...data.channels, channel]);
    }

    return (
        <AdminLayout title="Insights" heading="Notifications">
            <Head title="Notifications" />
            <form
                className="card-surface mb-6 space-y-4 p-5"
                onSubmit={(event) => {
                    event.preventDefault();
                    post(route('admin.notifications.store'), { onSuccess: () => reset('subject', 'body') });
                }}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Audience</label>
                        <select value={data.audience} onChange={(e) => setData('audience', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            <option value="vendors">Sellers</option>
                            <option value="customers">Customers</option>
                            <option value="staff">Staff</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap items-end gap-4 text-sm">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={data.channels.includes('in_app')} onChange={() => toggleChannel('in_app')} /> In-app (sellers)</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={data.channels.includes('email')} onChange={() => toggleChannel('email')} /> Email</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={data.channels.includes('sms')} onChange={() => toggleChannel('sms')} /> SMS</label>
                    </div>
                </div>
                <input value={data.subject} onChange={(e) => setData('subject', e.target.value)} placeholder="Subject" className="w-full rounded-xl border-outline-variant" required />
                <textarea value={data.body} onChange={(e) => setData('body', e.target.value)} rows={4} placeholder="Message" className="w-full rounded-xl border-outline-variant" required />
                <InputError message={errors.channels || errors.subject || errors.body} />
                <p className="text-sm text-on-surface-variant">
                    In-app notices are delivered to seller shops. Email uses the mailer already configured on the server.
                    SMS {sms_ready ? 'uses the gateway URL on the server.' : 'is recorded but not sent until SMS_GATEWAY_URL is set. No message is invented as delivered.'}
                </p>
                <button type="submit" className="btn-primary" disabled={processing}>Send</button>
            </form>
            <div className="card-surface overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-container text-xs uppercase text-on-surface-variant">
                        <tr>
                            <th className="px-4 py-3">When</th>
                            <th className="px-4 py-3">Subject</th>
                            <th className="px-4 py-3">Audience</th>
                            <th className="px-4 py-3">Result</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {dispatches.data.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">No notifications sent yet.</td></tr>
                        ) : dispatches.data.map((dispatch) => (
                            <tr key={dispatch.id}>
                                <td className="px-4 py-3">{dispatch.created_at}</td>
                                <td className="px-4 py-3 font-semibold">{dispatch.subject}</td>
                                <td className="px-4 py-3">{dispatch.audience} · {dispatch.channels}</td>
                                <td className="px-4 py-3">{dispatch.status} · {dispatch.sent}/{dispatch.recipients}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={dispatches.links} />
        </AdminLayout>
    );
}
