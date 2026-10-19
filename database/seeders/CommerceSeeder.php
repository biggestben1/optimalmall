<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReturnStatus;
use App\Enums\ReviewStatus;
use App\Enums\SettlementStatus;
use App\Enums\UserRole;
use App\Models\Advertisement;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderReturn;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Review;
use App\Models\Settlement;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class CommerceSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::query()->updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'type' => 'percent',
                'value' => 10,
                'min_order' => 20000,
                'usage_limit' => 500,
                'used_count' => 18,
                'is_active' => true,
            ],
        );

        Coupon::query()->updateOrCreate(
            ['code' => 'LAGOS5000'],
            [
                'type' => 'fixed',
                'value' => 5000,
                'min_order' => 50000,
                'usage_limit' => 100,
                'used_count' => 4,
                'is_active' => true,
            ],
        );

        Advertisement::query()->updateOrCreate(
            ['title' => 'Homepage phone deals'],
            [
                'placement' => 'homepage',
                'image_path' => 'https://picsum.photos/seed/omads1/1200/400',
                'link_url' => '/products',
                'budget' => 250000,
                'is_active' => true,
            ],
        );

        Advertisement::query()->updateOrCreate(
            ['title' => 'Search results fashion'],
            [
                'placement' => 'search',
                'image_path' => 'https://picsum.photos/seed/omads2/800/300',
                'link_url' => '/products',
                'budget' => 120000,
                'is_active' => true,
            ],
        );

        $customer = User::query()->where('email', 'customer@optimalmall.ng')->first();
        $products = Product::query()->with('vendor')->limit(2)->get();
        $vendor = Vendor::query()->first();

        if ($products->isEmpty() || $vendor === null) {
            return;
        }

        Review::query()->updateOrCreate(
            ['product_id' => $products[0]->id, 'author_name' => 'Ada Okonkwo'],
            [
                'user_id' => $customer?->id,
                'rating' => 5,
                'body' => 'Fast delivery and the item matched the listing.',
                'status' => ReviewStatus::Published,
            ],
        );

        if (isset($products[1])) {
            Review::query()->updateOrCreate(
                ['product_id' => $products[1]->id, 'author_name' => 'Tunde Bello'],
                [
                    'rating' => 4,
                    'body' => 'Good quality. Packaging could be stronger.',
                    'status' => ReviewStatus::Pending,
                ],
            );
        }

        Settlement::query()->updateOrCreate(
            ['reference' => 'SET-1001'],
            [
                'vendor_id' => $vendor->id,
                'amount' => 186000,
                'status' => SettlementStatus::Pending,
                'period_start' => now()->startOfMonth()->toDateString(),
                'period_end' => now()->endOfMonth()->toDateString(),
            ],
        );

        if (Order::query()->where('number', 'OM-1001')->exists()) {
            return;
        }

        $first = $products[0];
        $second = $products[1] ?? $products[0];
        $subtotal = ((float) $first->price) + ((float) $second->price);
        $shipping = 3500;

        $order = Order::query()->create([
            'number' => 'OM-1001',
            'user_id' => $customer?->id,
            'customer_name' => $customer?->name ?? 'Emeka Customer',
            'customer_email' => $customer?->email ?? 'customer@optimalmall.ng',
            'status' => OrderStatus::Paid,
            'subtotal' => $subtotal,
            'shipping_fee' => $shipping,
            'total' => $subtotal + $shipping,
            'placed_at' => now()->subDays(2),
        ]);

        foreach ([$first, $second] as $product) {
            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'vendor_id' => $product->vendor_id,
                'title' => $product->title,
                'quantity' => 1,
                'unit_price' => $product->price,
                'line_total' => $product->price,
            ]);
        }

        Payment::query()->create([
            'order_id' => $order->id,
            'reference' => 'PAY-1001',
            'method' => 'transfer',
            'amount' => $order->total,
            'status' => PaymentStatus::Successful,
            'paid_at' => now()->subDays(2),
        ]);

        OrderReturn::query()->create([
            'order_id' => $order->id,
            'reason' => 'Changed my mind',
            'status' => ReturnStatus::Requested,
            'refund_amount' => $second->price,
            'notes' => 'Customer asked to return one item.',
        ]);

        User::query()->updateOrCreate(
            ['email' => 'support@optimalmall.ng'],
            [
                'name' => 'Support Desk',
                'password' => 'password',
                'role' => UserRole::CustomerSupport,
                'email_verified_at' => now(),
            ],
        );
    }
}
