<?php

namespace App\Services\Storefront;

use App\Enums\OrderStatus;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Services\Accounting\Books;
use App\Support\Cart;
use App\Support\MarketplaceSettings;
use App\Support\Money;
use App\Support\Offer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class Checkout
{
    public const FREE_DELIVERY_FROM = 100000;

    public const SHIPPING_FEE = 3500;

    public function __construct(private Cart $cart, private Offer $offer) {}

    /**
     * @param  list<array<string, mixed>>  $lines
     * @return array{subtotal: float, shipping: float, total: float, subtotal_label: string, shipping_label: string, total_label: string, free_delivery: bool}
     */
    public function quote(array $lines): array
    {
        $applied = $this->offer->apply($lines);
        $subtotal = round(array_sum(array_map(fn (array $line) => (float) $line['line_total'], $lines)), 2);
        $discount = $applied['discount'];
        $payable = round($subtotal - $discount, 2);
        $shipping = $payable > 0 && $payable < self::FREE_DELIVERY_FROM ? self::SHIPPING_FEE : 0.0;
        $total = round($payable + $shipping, 2);

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shipping,
            'total' => $total,
            'subtotal_label' => Money::format($subtotal),
            'discount_label' => $discount > 0 ? Money::format($discount) : null,
            'shipping_label' => $shipping === 0.0 ? 'Free' : Money::format($shipping),
            'total_label' => Money::format($total),
            'free_delivery' => $payable >= self::FREE_DELIVERY_FROM,
            'coupon' => $applied['code'],
            'coupon_message' => $applied['message'],
        ];
    }

    /**
     * @param  array{customer_name: string, customer_email: string, shipping_address: string, payment_method: string}  $details
     */
    public function place(array $details, ?User $user): Order
    {
        $lines = $this->cart->lines();

        if ($lines === []) {
            throw ValidationException::withMessages([
                'cart' => 'Your cart is empty.',
            ]);
        }

        $quote = $this->quote($lines);

        if ($details['payment_method'] === 'wallet') {
            $this->assertWalletCanPay($user, $quote['total']);
        }

        $order = DB::transaction(function () use ($details, $user) {
            $products = Product::query()
                ->whereIn('id', array_keys($this->cartQuantities()))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0.0;
            $prepared = [];

            foreach ($this->cartQuantities() as $productId => $quantity) {
                $product = $products->get($productId);

                if ($product === null || $product->status->value !== 'active' || $product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'cart' => 'A product in your cart is no longer available in that quantity.',
                    ]);
                }

                $lineTotal = round((float) $product->price * $quantity, 2);
                $subtotal += $lineTotal;
                $prepared[] = [$product, $quantity, $lineTotal];
            }

            $subtotal = round($subtotal, 2);
            $applied = $this->offer->apply(array_map(fn (array $row) => [
                'vendor_id' => $row[0]->vendor_id,
                'line_total' => $row[2],
            ], $prepared));

            if ($applied['code'] !== null && $applied['discount'] <= 0) {
                throw ValidationException::withMessages([
                    'code' => $applied['message'] ?? 'This coupon cannot be used on this cart.',
                ]);
            }

            foreach ($prepared as $index => $row) {
                $prepared[$index][2] = (float) $applied['lines'][$index]['line_total'];
            }

            $payable = round($subtotal - $applied['discount'], 2);
            $shipping = $payable > 0 && $payable < self::FREE_DELIVERY_FROM ? (float) self::SHIPPING_FEE : 0.0;
            $total = round($payable + $shipping, 2);

            $order = Order::query()->create([
                'number' => $this->number(),
                'user_id' => $user?->id,
                'customer_name' => $details['customer_name'],
                'customer_email' => $details['customer_email'],
                'shipping_address' => $details['shipping_address'],
                'status' => OrderStatus::Pending,
                'subtotal' => $payable,
                'shipping_fee' => $shipping,
                'total' => $total,
                'placed_at' => now(),
            ]);

            foreach ($prepared as [$product, $quantity, $lineTotal]) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'vendor_id' => $product->vendor_id,
                    'title' => $product->title,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                    'line_total' => $lineTotal,
                ]);
                $product->decrement('stock', $quantity);
            }

            if ($details['payment_method'] === 'wallet') {
                app(Books::class)->payOrder($user, $order);
                $order->update(['status' => OrderStatus::Paid]);
            }

            if ($applied['discount'] > 0 && $this->offer->coupon() !== null) {
                $coupon = Coupon::query()->whereKey($this->offer->coupon()->id)->lockForUpdate()->first();

                if ($coupon === null || ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit)) {
                    throw ValidationException::withMessages([
                        'code' => 'This coupon has been used up.',
                    ]);
                }

                $coupon->increment('used_count');
            }

            return $order->fresh();
        });

        $this->cart->clear();
        $this->offer->forget();

        $order->load('items.vendor');
        $order->items->pluck('vendor')->filter()->unique('id')->each(function ($vendor) use ($order) {
            $vendor->notifyPortal('New order '.$order->number, $order->customer_name.' placed an order for '.$vendor->name.'.');
        });

        return $order;
    }

    public function walletOption(?User $user, float $total): ?array
    {
        if ($user === null || ! $user->isCustomer() || ! MarketplaceSettings::enabled('wallet_payments_enabled', true)) {
            return null;
        }

        $balance = app(Books::class)->customerWallet($user)->balance();

        return [
            'balance_label' => Money::format($balance),
            'covers_total' => $balance + 0.009 >= $total,
        ];
    }

    private function assertWalletCanPay(?User $user, float $total): void
    {
        if ($user === null || ! $user->isCustomer()) {
            throw ValidationException::withMessages([
                'payment_method' => 'Sign in with a customer account to pay from your wallet.',
            ]);
        }

        if (! MarketplaceSettings::enabled('wallet_payments_enabled', true)) {
            throw ValidationException::withMessages([
                'payment_method' => 'Wallet payments are turned off.',
            ]);
        }

        $balance = app(Books::class)->customerWallet($user)->balance();

        if ($balance + 0.009 < $total) {
            throw ValidationException::withMessages([
                'payment_method' => 'Your wallet balance does not cover this order.',
            ]);
        }
    }

    /**
     * @return array<int, int>
     */
    private function cartQuantities(): array
    {
        $quantities = [];

        foreach ($this->cart->lines() as $line) {
            $quantities[$line['id']] = $line['quantity'];
        }

        return $quantities;
    }

    private function number(): string
    {
        do {
            $number = 'OM-'.now()->format('ymd').'-'.Str::upper(Str::random(4));
        } while (Order::query()->where('number', $number)->exists());

        return $number;
    }
}
