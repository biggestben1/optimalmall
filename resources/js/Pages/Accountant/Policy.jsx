import { useForm } from '@inertiajs/react';
import AccountantLayout from '../../Layouts/AccountantLayout';

export default function Policy({ settings, actions }) {
    const form = useForm({
        ...settings,
        regulatory_confirmed: false,
        permissions: actions.filter((action) => action.enabled).map((action) => action.key),
    });

    const toggle = (key) => {
        const next = form.data.permissions.includes(key)
            ? form.data.permissions.filter((item) => item !== key)
            : [...form.data.permissions, key];
        form.setData('permissions', next);
    };

    return (
        <AccountantLayout title="Wallet policy" heading="Wallet policy">
            <form className="card-surface grid max-w-3xl gap-4 p-4" onSubmit={(event) => { event.preventDefault(); form.put(route('accountant.policy')); }}>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.wallet_deposits_enabled} onChange={(event) => form.setData('wallet_deposits_enabled', event.target.checked)} /> Accept customer deposits</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.regulatory_confirmed} onChange={(event) => form.setData('regulatory_confirmed', event.target.checked)} /> A licensed payment provider is connected and the applicable Nigerian stored-value rules have been confirmed</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.wallet_payments_enabled} onChange={(event) => form.setData('wallet_payments_enabled', event.target.checked)} /> Allow wallet payments for eligible orders</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.wallet_refunds_to_wallet} onChange={(event) => form.setData('wallet_refunds_to_wallet', event.target.checked)} /> Credit eligible refunds to the customer wallet</label>
                <Field label="Transaction limit" name="wallet_transaction_limit" form={form} />
                <Field label="Daily limit" name="wallet_daily_limit" form={form} />
                <Field label="Maximum balance" name="wallet_max_balance" form={form} />
                <Field label="Gateway fee percent" name="gateway_fee_percent" form={form} />
                <Field label="Payout approval threshold" name="payout_approval_threshold" form={form} />
                <fieldset className="space-y-2">
                    <legend className="text-sm font-semibold">Accountant permissions</legend>
                    {actions.map((action) => (
                        <label key={action.key} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.permissions.includes(action.key)} onChange={() => toggle(action.key)} />
                            {action.label}
                        </label>
                    ))}
                </fieldset>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white" disabled={form.processing}>Save policy</button>
            </form>
        </AccountantLayout>
    );
}

function Field({ label, name, form }) {
    return (
        <label className="text-sm">
            <span className="mb-1 block text-on-surface-variant">{label}</span>
            <input className="w-full rounded-lg border px-3 py-2" type="number" step="0.01" value={form.data[name]} onChange={(event) => form.setData(name, event.target.value)} />
        </label>
    );
}
