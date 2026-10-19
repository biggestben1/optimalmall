import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import InputError from '../../../Components/Admin/InputError';

export default function Edit({ settings, integrations }) {
    const { data, setData, put, processing, errors } = useForm(settings);

    return (
        <AdminLayout title="System" heading="Settings">
            <Head title="Settings" />
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    put(route('admin.settings.update'));
                }}
                className="card-surface max-w-3xl space-y-4 p-6"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Store name</label>
                        <input value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.store_name} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Support email</label>
                        <input type="email" value={data.support_email} onChange={(e) => setData('support_email', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                        <InputError message={errors.support_email} />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Home SEO title</label>
                    <input value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-bold uppercase">Home SEO description</label>
                    <textarea value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} rows={3} className="w-full rounded-xl border-outline-variant" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Low stock threshold</label>
                        <input type="number" min="0" value={data.low_stock_threshold} onChange={(e) => setData('low_stock_threshold', e.target.value)} className="w-full rounded-xl border-outline-variant" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase">Payment provider label</label>
                        <select value={data.payment_provider} onChange={(e) => setData('payment_provider', e.target.value)} className="w-full rounded-xl border-outline-variant">
                            <option value="manual">Manual</option>
                            <option value="paystack">Paystack</option>
                            <option value="flutterwave">Flutterwave</option>
                        </select>
                    </div>
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.require_product_approval} onChange={(e) => setData('require_product_approval', e.target.checked)} /> Sellers must wait for listing approval</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.two_factor_required} onChange={(e) => setData('two_factor_required', e.target.checked)} /> Require two-factor for master admins and accountants</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.notify_email} onChange={(e) => setData('notify_email', e.target.checked)} /> Send notification emails</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.notify_sms} onChange={(e) => setData('notify_sms', e.target.checked)} /> Send SMS when a gateway is configured</label>
                <button type="submit" className="btn-primary" disabled={processing}>Save settings</button>
            </form>
            <div className="card-surface mt-6 max-w-3xl space-y-3 p-6 text-sm">
                <h2 className="font-display text-lg font-bold">Integrations and backups</h2>
                <p>Webhook secret: {integrations.webhook_secret ? 'configured' : 'not set (PAYMENT_WEBHOOK_SECRET)'}.</p>
                <p>SMS gateway: {integrations.sms_gateway ? 'configured' : 'not set (SMS_GATEWAY_URL)'}.</p>
                <p>Mailer: {integrations.mailer}. Payment secrets stay in the server environment.</p>
                <p>Last configuration backup: {settings.last_backup_at || 'none yet'}.</p>
                <div className="flex flex-wrap gap-3">
                    <button type="button" className="btn-primary" onClick={() => { if (window.confirm('Save a configuration backup on the server?')) router.post(route('admin.settings.backup')); }}>Save backup</button>
                    {settings.last_backup_at && <a href={route('admin.settings.backup.download')} className="font-bold text-primary">Download last backup</a>}
                </div>
            </div>
        </AdminLayout>
    );
}
