<?php

namespace App\Services\Vendor;

use App\Enums\PaymentStatus;
use App\Enums\PayoutStatus;
use App\Enums\ReturnStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\Vendor;
use Illuminate\Support\Collection;

class Earnings
{
    public function __construct(private Vendor $vendor) {}

    public function rateFor(OrderItem $item): float
    {
        if ($item->commission_rate !== null) {
            return (float) $item->commission_rate;
        }

        if ($this->vendor->commission_rate !== null) {
            return (float) $this->vendor->commission_rate;
        }

        return (float) config('marketplace.commission_rate');
    }

    public function commissionFor(OrderItem $item): float
    {
        if ($item->commission_amount !== null) {
            return round((float) $item->commission_amount, 2);
        }

        return round((float) $item->line_total * $this->rateFor($item) / 100, 2);
    }

    public function isPaid(?Order $order): bool
    {
        return $order?->payments->contains(
            fn ($payment) => $payment->status === PaymentStatus::Successful
        ) ?? false;
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function statements(): Collection
    {
        $items = OrderItem::query()
            ->with(['order.payments', 'order.returns', 'order.items'])
            ->where('vendor_id', $this->vendor->id)
            ->get()
            ->groupBy('order_id');

        return $items->map(function (Collection $group) {
            /** @var Order|null $order */
            $order = $group->first()?->order;
            $gross = round((float) $group->sum(fn (OrderItem $item) => (float) $item->line_total), 2);
            $commission = round((float) $group->sum(fn (OrderItem $item) => $this->commissionFor($item)), 2);
            $refund = $this->refundShare($order, $gross);
            $paid = $this->isPaid($order);

            return [
                'order_id' => $order?->id,
                'number' => $order?->number,
                'placed_at' => $order?->placed_at?->format('d M Y'),
                'customer_name' => $order?->customer_name,
                'gross' => $gross,
                'commission' => $commission,
                'refund' => $refund,
                'net' => $paid ? round($gross - $commission - $refund, 2) : 0.0,
                'paid' => $paid,
                'payment_status' => $paid ? 'Verified' : 'Unverified',
            ];
        })->sortByDesc('order_id')->values();
    }

    public function refundShare(?Order $order, float $vendorGross): float
    {
        if ($order === null || $vendorGross <= 0) {
            return 0.0;
        }

        $refunded = (float) $order->returns
            ->filter(fn ($return) => in_array($return->status, [ReturnStatus::Approved, ReturnStatus::Refunded], true))
            ->sum(fn ($return) => (float) $return->refund_amount);

        $base = (float) $order->subtotal;

        if ($base <= 0) {
            $base = (float) $order->items->sum(fn ($item) => (float) $item->line_total);
        }

        if ($base <= 0 || $refunded <= 0) {
            return 0.0;
        }

        return round(min($vendorGross, $refunded * ($vendorGross / $base)), 2);
    }

    /**
     * @return array{gross: float, commission: float, refunds: float, net: float, reserved: float, available: float, unverified: float, orders: int, paid_orders: int}
     */
    public function summary(): array
    {
        $lines = $this->statements();
        $paidLines = $lines->where('paid', true);
        $gross = round((float) $paidLines->sum('gross'), 2);
        $commission = round((float) $paidLines->sum('commission'), 2);
        $refunds = round((float) $paidLines->sum('refund'), 2);
        $net = round($gross - $commission - $refunds, 2);
        $reserved = round((float) Payout::query()
            ->where('vendor_id', $this->vendor->id)
            ->whereIn('status', [PayoutStatus::Requested, PayoutStatus::Approved, PayoutStatus::Paid])
            ->sum('amount'), 2);

        return [
            'gross' => $gross,
            'commission' => $commission,
            'refunds' => $refunds,
            'net' => $net,
            'reserved' => $reserved,
            'available' => round(max(0, $net - $reserved), 2),
            'unverified' => round((float) $lines->where('paid', false)->sum('gross'), 2),
            'orders' => $lines->count(),
            'paid_orders' => $paidLines->count(),
        ];
    }

    public function canRelease(Payout $payout): bool
    {
        $net = $this->summary()['net'];
        $other = (float) Payout::query()
            ->where('vendor_id', $this->vendor->id)
            ->whereKeyNot($payout->id)
            ->whereIn('status', [PayoutStatus::Requested, PayoutStatus::Approved, PayoutStatus::Paid])
            ->sum('amount');

        return $net + 0.009 >= $other + (float) $payout->amount;
    }
}
