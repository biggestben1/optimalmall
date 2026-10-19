<?php

namespace App\Services\Vendor;

use App\Enums\CouponType;
use App\Enums\FulfilmentStatus;
use App\Enums\OrderStatus;
use App\Enums\PayoutStatus;
use App\Enums\ProductApproval;
use App\Enums\ProductStatus;
use App\Enums\TicketStatus;
use App\Models\Advertisement;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\SupportTicket;
use App\Models\User;
use App\Models\Vendor;
use App\Models\VendorBankAccount;
use App\Models\VendorNotification;
use App\Services\Accounting\Books;
use App\Support\Money;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class Portal
{
    public function __construct(public Vendor $shop, public User $user) {}

    public static function current(): self
    {
        $user = auth()->user();
        abort_if($user === null || ! $user->isVendor(), 403);

        $shop = $user->vendor;
        abort_if($shop === null, 403);

        return new self($shop, $user);
    }

    public function assertActive(): void
    {
        abort_unless($this->shop->isActive(), 403, 'This shop is waiting for admin approval.');
    }

    public function earnings(): Earnings
    {
        return new Earnings($this->shop);
    }

    /**
     * @return array<string, mixed>
     */
    public function dashboard(): array
    {
        $summary = $this->earnings()->summary();
        $lowStock = $this->shop->products()->where('stock', '<=', 5)->count();

        return [
            'shop' => $this->shopPayload(),
            'summary' => $summary,
            'stats' => [
                ['label' => 'Sales', 'value' => Money::format($summary['gross'])],
                ['label' => 'Orders', 'value' => (string) $summary['orders']],
                ['label' => 'Products', 'value' => (string) $this->shop->products()->count()],
                ['label' => 'Earnings', 'value' => Money::format($summary['available'])],
                ['label' => 'Low stock', 'value' => (string) $lowStock],
            ],
            'orders' => $this->shop->orderItems()
                ->with('order')
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (OrderItem $item) => [
                    'id' => $item->id,
                    'order_id' => $item->order_id,
                    'order_number' => $item->order?->number,
                    'title' => $item->title,
                    'quantity' => $item->quantity,
                    'total' => Money::format($item->line_total),
                    'fulfilment' => $item->fulfilment_status?->label() ?? 'Pending',
                ])
                ->values(),
            'products' => $this->shop->products()->latest()->limit(6)->get()->map(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'stock' => $product->stock,
                'price' => $product->formattedPrice(),
                'approval' => $product->approval_status?->label() ?? 'Approved',
            ])->values(),
            'notifications' => $this->shop->notifications()->latest()->limit(5)->get()->map(fn (VendorNotification $notification) => [
                'id' => $notification->id,
                'title' => $notification->title,
                'body' => $notification->body,
                'read' => $notification->read_at !== null,
                'created_at' => $notification->created_at?->diffForHumans(),
            ])->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function shopPayload(): array
    {
        return [
            'name' => $this->shop->name,
            'business_name' => $this->shop->business_name,
            'registration_number' => $this->shop->registration_number,
            'description' => $this->shop->description,
            'email' => $this->shop->email,
            'phone' => $this->shop->phone,
            'city' => $this->shop->city,
            'state' => $this->shop->state,
            'address' => $this->shop->address,
            'logo_path' => $this->shop->logo_path,
            'status' => $this->shop->status->value,
            'status_label' => $this->shop->status->label(),
            'commission_rate' => (float) ($this->shop->commission_rate ?? config('marketplace.commission_rate')),
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function updateShop(array $input): void
    {
        $data = validator($input, [
            'name' => ['required', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'logo_path' => ['nullable', 'url', 'max:500'],
        ])->validate();

        if ($this->shop->name !== $data['name']) {
            $data['slug'] = $this->uniqueSlug($data['name'], Vendor::class);
        }

        $this->shop->update($data);
        AuditLogger::record('shop.updated', $this->shop, ['name' => $this->shop->name], $this->shop, $this->user);
    }

    public function products(string $search = '', string $status = '', string $approval = ''): LengthAwarePaginator
    {
        return $this->shop->products()
            ->when($search !== '', function ($query) use ($search) {
                $term = '%'.$search.'%';
                $query->where(function ($inner) use ($term) {
                    $inner->where('title', 'like', $term)
                        ->orWhere('description', 'like', $term)
                        ->orWhere('sku', 'like', $term)
                        ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', $term));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($approval !== '', fn ($query) => $query->where('approval_status', $approval))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'price' => (float) $product->price,
                'formatted_price' => $product->formattedPrice(),
                'stock' => $product->stock,
                'sku' => $product->sku,
                'status' => $product->status->value,
                'status_label' => $product->status->label(),
                'approval' => $product->approval_status?->value,
                'approval_label' => $product->approval_status?->label() ?? 'Not submitted',
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function productForm(?Product $product = null): array
    {
        if ($product) {
            $this->ownedProduct($product);
            $product->load('images');
        }

        $images = $product?->images->pluck('path')->all() ?? [];
        $remoteImages = array_values(array_filter($images, fn (string $path) => str_starts_with($path, 'http://') || str_starts_with($path, 'https://')));

        return [
            'product' => [
                'id' => $product?->id,
                'category_id' => $product?->category_id,
                'title' => $product?->title ?? '',
                'description' => $product?->description ?? '',
                'price' => $product?->price ?? '',
                'compare_at_price' => $product?->compare_at_price ?? '',
                'stock' => $product?->stock ?? 0,
                'sku' => $product?->sku ?? '',
                'status' => $product?->status->value ?? ProductStatus::Draft->value,
                'approval_label' => $product?->approval_status?->label(),
                'image_url' => $remoteImages[0] ?? '',
                'image_urls' => implode("\n", array_slice($remoteImages, 1)),
                'image_preview' => isset($images[0]) ? $this->imageUrl($images[0]) : '',
                'image_previews' => array_map(fn (string $path) => $this->imageUrl($path), $images),
            ],
            'categories' => Category::query()->whereNotNull('parent_id')->orderBy('name')->get(['id', 'name']),
            'statuses' => collect(ProductStatus::cases())->map(fn (ProductStatus $status) => [
                'value' => $status->value,
                'label' => $status === ProductStatus::Active && config('marketplace.require_product_approval')
                    ? 'Submit for approval'
                    : $status->label(),
            ])->all(),
            'approval_required' => (bool) config('marketplace.require_product_approval'),
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function saveProduct(array $input, ?Product $product = null): Product
    {
        $this->assertActive();

        if ($product) {
            $this->ownedProduct($product);
        }

        $data = validator($input, [
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product?->id)],
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'image_url' => ['nullable', 'url', 'max:500'],
            'image_urls' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'max:4096'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['image', 'max:4096'],
        ])->validate();

        $extraImages = collect(preg_split('/\r\n|\r|\n/', (string) ($data['image_urls'] ?? '')))
            ->map(fn ($url) => trim($url))
            ->filter();
        $imageUrl = $data['image_url'] ?? null;
        $uploads = collect([$input['image'] ?? null])
            ->merge($input['images'] ?? [])
            ->filter(fn ($file) => $file instanceof UploadedFile)
            ->map(fn (UploadedFile $file) => $file->store('products', 'public'))
            ->values();
        unset($data['image_url'], $data['image_urls'], $data['image'], $data['images']);

        if (($data['compare_at_price'] ?? '') === '') {
            $data['compare_at_price'] = null;
        }

        $requested = ProductStatus::from($data['status']);
        $submitted = false;

        if (config('marketplace.require_product_approval') && $requested === ProductStatus::Active) {
            $data['status'] = ProductStatus::Draft->value;
            $data['approval_status'] = ProductApproval::Pending->value;
            $submitted = true;
        } elseif ($requested === ProductStatus::Active) {
            $data['approval_status'] = ProductApproval::Approved->value;
        }

        if ($product === null) {
            $data['vendor_id'] = $this->shop->id;
            $data['slug'] = $this->uniqueSlug($data['title'], Product::class);
            $product = Product::query()->create($data);
            AuditLogger::record('product.created', $product, ['title' => $product->title], $this->shop, $this->user);
        } else {
            if ($product->title !== $data['title']) {
                $data['slug'] = $this->uniqueSlug($data['title'], Product::class, $product->id);
            }

            $product->update($data);
            AuditLogger::record('product.updated', $product, ['title' => $product->title], $this->shop, $this->user);
        }

        $this->syncImages($product, $imageUrl, $extraImages, $uploads);

        if ($submitted) {
            $this->shop->notifyPortal('Product submitted', $product->title.' is waiting for admin approval.');
        }

        return $product;
    }

    public function deleteProduct(Product $product): void
    {
        $this->assertActive();
        $this->ownedProduct($product);
        AuditLogger::record('product.deleted', $product, ['title' => $product->title], $this->shop, $this->user);
        $product->delete();
    }

    public function inventory(string $search = '', bool $lowOnly = false): LengthAwarePaginator
    {
        return $this->shop->products()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('title', 'like', '%'.$search.'%')->orWhere('sku', 'like', '%'.$search.'%');
            }))
            ->when($lowOnly, fn ($query) => $query->where('stock', '<=', 5))
            ->orderBy('stock')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->title,
                'sku' => $product->sku,
                'stock' => $product->stock,
                'low' => $product->stock <= 5,
            ]);
    }

    public function adjustStock(Product $product, int $stock): void
    {
        $this->assertActive();
        $this->ownedProduct($product);
        $previous = $product->stock;
        $product->update(['stock' => $stock]);
        AuditLogger::record('inventory.adjusted', $product, [
            'from' => $previous,
            'to' => $stock,
        ], $this->shop, $this->user);

        if ($stock <= 5 && $previous > 5) {
            $this->shop->notifyPortal('Low stock', $product->title.' has '.$stock.' left.');
        }
    }

    public function orders(string $search = '', string $status = ''): LengthAwarePaginator
    {
        return Order::query()
            ->whereHas('items', fn ($query) => $query->where('vendor_id', $this->shop->id))
            ->with(['items' => fn ($query) => $query->where('vendor_id', $this->shop->id), 'payments'])
            ->when($search !== '', fn ($query) => $query->where('number', 'like', '%'.$search.'%'))
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest('placed_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Order $order) => $this->orderSummary($order));
    }

    /**
     * @return array<string, mixed>
     */
    public function orderDetail(Order $order): array
    {
        $order->load([
            'items' => fn ($query) => $query->where('vendor_id', $this->shop->id),
            'payments',
            'returns',
        ]);
        abort_if($order->items->isEmpty(), 404);

        $summary = $this->orderSummary($order);
        $paid = (new Earnings($this->shop))->isPaid($order);

        return [
            ...$summary,
            'customer_email' => $order->customer_email,
            'shipping_address' => $order->shipping_address,
            'payment_status' => $paid ? 'Verified' : 'Unverified',
            'items' => $order->items->map(fn (OrderItem $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'quantity' => $item->quantity,
                'total' => Money::format($item->line_total),
                'fulfilment' => $item->fulfilment_status?->value ?? FulfilmentStatus::Pending->value,
                'fulfilment_label' => $item->fulfilment_status?->label() ?? 'Pending',
                'carrier' => $item->carrier,
                'tracking_number' => $item->tracking_number,
            ])->values(),
            'statuses' => collect(FulfilmentStatus::cases())->map(fn (FulfilmentStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function updateFulfilment(Order $order, array $input): void
    {
        $this->assertActive();
        $items = $order->items()->where('vendor_id', $this->shop->id)->get();
        abort_if($items->isEmpty(), 404);

        $data = validator($input, [
            'fulfilment_status' => ['required', Rule::enum(FulfilmentStatus::class)],
            'carrier' => ['nullable', 'string', 'max:100'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ])->validate();

        $status = FulfilmentStatus::from($data['fulfilment_status']);
        $timestamps = [];

        if ($status === FulfilmentStatus::Shipped) {
            $timestamps['shipped_at'] = now();
        }

        if ($status === FulfilmentStatus::Delivered) {
            $timestamps['shipped_at'] = $items->first()?->shipped_at ?? now();
            $timestamps['delivered_at'] = now();
        }

        $order->items()->where('vendor_id', $this->shop->id)->update([
            ...$data,
            ...$timestamps,
        ]);

        $foreignItems = $order->items()->where('vendor_id', '!=', $this->shop->id)->exists();

        if (! $foreignItems) {
            $orderStatus = match ($status) {
                FulfilmentStatus::Processing => OrderStatus::Processing,
                FulfilmentStatus::Shipped => OrderStatus::Shipped,
                FulfilmentStatus::Delivered => OrderStatus::Delivered,
                FulfilmentStatus::Cancelled => OrderStatus::Cancelled,
                default => $order->status,
            };
            $order->update(['status' => $orderStatus]);
        }

        AuditLogger::record('order.fulfilment', $order, $data, $this->shop, $this->user);
    }

    /**
     * @return array<string, mixed>
     */
    public function finance(): array
    {
        $summary = $this->earnings()->summary();
        $lines = $this->earnings()->statements()->map(fn (array $line) => [
            ...$line,
            'gross_label' => Money::format($line['gross']),
            'commission_label' => Money::format($line['commission']),
            'refund_label' => Money::format($line['refund']),
            'net_label' => Money::format($line['net']),
        ])->values();

        return [
            'summary' => [
                ...$summary,
                'gross_label' => Money::format($summary['gross']),
                'commission_label' => Money::format($summary['commission']),
                'refunds_label' => Money::format($summary['refunds']),
                'net_label' => Money::format($summary['net']),
                'available_label' => Money::format($summary['available']),
                'unverified_label' => Money::format($summary['unverified']),
                'paid_label' => Money::format((float) $this->shop->payouts()->where('status', PayoutStatus::Paid)->sum('amount')),
                'wallet_label' => Money::format(app(Books::class)->vendorWallet($this->shop)->balance()),
            ],
            'lines' => $lines,
            'rate' => (float) ($this->shop->commission_rate ?? config('marketplace.commission_rate')),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function payouts(): array
    {
        $bank = $this->shop->bankAccounts()->where('is_primary', true)->first()
            ?? $this->shop->bankAccounts()->first();
        $summary = $this->earnings()->summary();

        return [
            'available' => $summary['available'],
            'available_label' => Money::format($summary['available']),
            'bank' => $bank ? [
                'bank_name' => $bank->bank_name,
                'account_name' => $bank->account_name,
                'account_number' => $bank->account_number,
            ] : null,
            'payouts' => $this->shop->payouts()->latest()->paginate(15)->withQueryString()->through(fn (Payout $payout) => [
                'id' => $payout->id,
                'reference' => $payout->reference,
                'amount' => (float) $payout->amount,
                'amount_label' => Money::format($payout->amount),
                'status' => $payout->status->value,
                'status_label' => $payout->status->label(),
                'note' => $payout->note,
                'rejection_reason' => $payout->rejection_reason,
                'paid_at' => $payout->paid_at?->format('d M Y'),
                'created_at' => $payout->created_at?->format('d M Y'),
            ]),
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function saveBank(array $input): VendorBankAccount
    {
        $data = validator($input, [
            'bank_name' => ['required', 'string', 'max:100'],
            'account_name' => ['required', 'string', 'max:150'],
            'account_number' => ['required', 'string', 'max:20'],
        ])->validate();

        $bank = $this->shop->bankAccounts()->updateOrCreate(
            ['is_primary' => true],
            [...$data, 'is_primary' => true],
        );

        AuditLogger::record('bank.updated', $bank, ['bank_name' => $bank->bank_name], $this->shop, $this->user);

        return $bank;
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function requestPayout(array $input): Payout
    {
        $this->assertActive();

        if (app(Books::class)->vendorWallet($this->shop)->isFrozen()) {
            throw ValidationException::withMessages([
                'amount' => 'Payouts are paused while this seller wallet is frozen.',
            ]);
        }

        $available = $this->earnings()->summary()['available'];
        $data = validator($input, [
            'amount' => ['required', 'numeric', 'min:1', 'max:'.$available],
            'note' => ['nullable', 'string', 'max:255'],
        ], [
            'amount.max' => 'Amount is above the earnings verified from successful payments.',
        ])->validate();

        $bank = $this->shop->bankAccounts()->where('is_primary', true)->first()
            ?? $this->shop->bankAccounts()->first();

        validator(['bank' => $bank?->id], [
            'bank' => ['required'],
        ], [
            'bank.required' => 'Add a bank account before requesting a payout.',
        ])->validate();

        $payout = $this->shop->payouts()->create([
            'vendor_bank_account_id' => $bank->id,
            'reference' => 'PO-'.now()->format('ymdHis').'-'.strtoupper(Str::random(4)),
            'amount' => $data['amount'],
            'status' => PayoutStatus::Requested,
            'note' => $data['note'] ?? null,
        ]);

        $this->shop->notifyPortal('Payout requested', $payout->reference.' for '.Money::format($payout->amount).' is waiting for release.');
        AuditLogger::record('payout.requested', $payout, ['amount' => $payout->amount], $this->shop, $this->user);

        return $payout;
    }

    public function coupons(): LengthAwarePaginator
    {
        return Coupon::query()->where('vendor_id', $this->shop->id)->latest()->paginate(15)->through(fn (Coupon $coupon) => [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'type' => $coupon->type->label(),
            'value' => (float) $coupon->value,
            'is_active' => $coupon->is_active,
            'ends_at' => $coupon->ends_at?->format('d M Y'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function saveCoupon(array $input, ?Coupon $coupon = null): Coupon
    {
        $this->assertActive();
        $this->ownedCoupon($coupon);
        $data = validator($input, [
            'code' => ['required', 'string', 'max:40', Rule::unique('coupons', 'code')->ignore($coupon?->id)],
            'type' => ['required', Rule::enum(CouponType::class)],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ])->validate();
        $data['vendor_id'] = $this->shop->id;
        $data['is_active'] = (bool) ($data['is_active'] ?? false);
        $data['code'] = strtoupper($data['code']);

        $coupon = $coupon
            ? tap($coupon)->update($data)
            : Coupon::query()->create($data);

        AuditLogger::record('coupon.saved', $coupon, ['code' => $coupon->code], $this->shop, $this->user);

        return $coupon;
    }

    public function deleteCoupon(Coupon $coupon): void
    {
        $this->assertActive();
        $this->ownedCoupon($coupon);
        AuditLogger::record('coupon.deleted', $coupon, ['code' => $coupon->code], $this->shop, $this->user);
        $coupon->delete();
    }

    public function campaigns(): LengthAwarePaginator
    {
        return Advertisement::query()->where('vendor_id', $this->shop->id)->latest()->paginate(15)->through(fn (Advertisement $ad) => [
            'id' => $ad->id,
            'title' => $ad->title,
            'placement' => $ad->placement,
            'budget' => Money::format($ad->budget),
            'is_active' => $ad->is_active,
            'ends_at' => $ad->ends_at?->format('d M Y'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function saveCampaign(array $input, ?Advertisement $campaign = null): Advertisement
    {
        $this->assertActive();
        $this->ownedCampaign($campaign);
        $data = validator($input, [
            'title' => ['required', 'string', 'max:255'],
            'placement' => ['required', 'string', 'max:50'],
            'image_path' => ['nullable', 'url', 'max:500'],
            'link_url' => ['nullable', 'url', 'max:500'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ])->validate();
        $data['vendor_id'] = $this->shop->id;
        $data['is_active'] = (bool) ($data['is_active'] ?? false);
        $data['budget'] = $data['budget'] ?? 0;

        $campaign = $campaign
            ? tap($campaign)->update($data)
            : Advertisement::query()->create($data);

        AuditLogger::record('campaign.saved', $campaign, ['title' => $campaign->title], $this->shop, $this->user);

        return $campaign;
    }

    public function deleteCampaign(Advertisement $campaign): void
    {
        $this->assertActive();
        $this->ownedCampaign($campaign);
        $campaign->delete();
    }

    public function reviews(string $search = ''): LengthAwarePaginator
    {
        return Review::query()
            ->whereHas('product', fn ($query) => $query->where('vendor_id', $this->shop->id))
            ->with('product')
            ->when($search !== '', fn ($query) => $query->where('body', 'like', '%'.$search.'%'))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Review $review) => [
                'id' => $review->id,
                'product' => $review->product?->title,
                'author' => $review->author_name,
                'rating' => $review->rating,
                'body' => $review->body,
                'reply' => $review->vendor_reply,
                'status' => $review->status->label(),
                'created_at' => $review->created_at?->format('d M Y'),
            ]);
    }

    public function replyToReview(Review $review, string $reply): void
    {
        $this->assertActive();
        abort_unless($review->product?->vendor_id === $this->shop->id, 404);
        validator(['reply' => $reply], ['reply' => ['required', 'string', 'max:1000']])->validate();
        $review->update(['vendor_reply' => $reply]);
        AuditLogger::record('review.replied', $review, [], $this->shop, $this->user);
    }

    public function tickets(string $status = ''): LengthAwarePaginator
    {
        return $this->shop->tickets()
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (SupportTicket $ticket) => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'status' => $ticket->status->value,
                'status_label' => $ticket->status->label(),
                'customer_name' => $ticket->customer_name,
                'updated_at' => $ticket->updated_at?->diffForHumans(),
            ]);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function openTicket(array $input): SupportTicket
    {
        $data = validator($input, [
            'subject' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:5000'],
            'customer_name' => ['nullable', 'string', 'max:150'],
            'customer_email' => ['nullable', 'email', 'max:255'],
        ])->validate();

        $ticket = $this->shop->tickets()->create([
            'subject' => $data['subject'],
            'status' => TicketStatus::Open,
            'customer_name' => $data['customer_name'] ?? null,
            'customer_email' => $data['customer_email'] ?? null,
        ]);
        $ticket->messages()->create([
            'user_id' => $this->user->id,
            'body' => $data['body'],
        ]);
        $this->shop->notifyPortal('Ticket opened', $ticket->subject);
        AuditLogger::record('ticket.opened', $ticket, ['subject' => $ticket->subject], $this->shop, $this->user);

        return $ticket;
    }

    /**
     * @return array<string, mixed>
     */
    public function ticketDetail(SupportTicket $ticket): array
    {
        abort_unless($ticket->vendor_id === $this->shop->id, 404);
        $ticket->load('messages.user');

        return [
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'status' => $ticket->status->value,
            'status_label' => $ticket->status->label(),
            'customer_name' => $ticket->customer_name,
            'customer_email' => $ticket->customer_email,
            'messages' => $ticket->messages->map(fn ($message) => [
                'id' => $message->id,
                'body' => $message->body,
                'author' => $message->user?->name ?? 'Marketplace',
                'mine' => $message->user_id === $this->user->id,
                'created_at' => $message->created_at?->format('d M Y H:i'),
            ])->values(),
        ];
    }

    public function replyToTicket(SupportTicket $ticket, string $body): void
    {
        abort_unless($ticket->vendor_id === $this->shop->id, 404);
        validator(['body' => $body], ['body' => ['required', 'string', 'max:5000']])->validate();
        $ticket->messages()->create(['user_id' => $this->user->id, 'body' => $body]);
        if ($ticket->status === TicketStatus::Closed) {
            $ticket->update(['status' => TicketStatus::Open]);
        }
    }

    public function notifications(): LengthAwarePaginator
    {
        return $this->shop->notifications()->latest()->paginate(20)->through(fn (VendorNotification $notification) => [
            'id' => $notification->id,
            'title' => $notification->title,
            'body' => $notification->body,
            'read' => $notification->read_at !== null,
            'created_at' => $notification->created_at?->diffForHumans(),
        ]);
    }

    public function markNotificationsRead(): void
    {
        $this->shop->notifications()->whereNull('read_at')->update(['read_at' => now()]);
    }

    /**
     * @return array<string, mixed>
     */
    public function reports(): array
    {
        $finance = $this->finance();
        $byProduct = OrderItem::query()
            ->where('vendor_id', $this->shop->id)
            ->selectRaw('title, sum(quantity) as units, sum(line_total) as revenue')
            ->groupBy('title')
            ->orderByDesc('revenue')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'title' => $row->title,
                'units' => (int) $row->units,
                'revenue' => Money::format($row->revenue),
            ]);

        return [
            'shop_name' => $this->shop->name,
            'stats' => [
                ['label' => 'Verified sales', 'value' => $finance['summary']['gross_label']],
                ['label' => 'Commission', 'value' => $finance['summary']['commission_label']],
                ['label' => 'Net earnings', 'value' => $finance['summary']['net_label']],
            ],
            'by_product' => $byProduct,
            'transactions' => $finance['lines'],
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function updateAccount(array $input): void
    {
        $data = validator($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user->id)],
        ])->validate();

        $this->user->update($data);
        AuditLogger::record('account.updated', $this->user, ['email' => $this->user->email], $this->shop, $this->user);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    public function updatePassword(array $input): void
    {
        $data = validator($input, [
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ])->validate();

        $this->user->update(['password' => $data['password']]);
        AuditLogger::record('account.password', $this->user, [], $this->shop, $this->user);
    }

    public function ownedProduct(Product $product): Product
    {
        abort_unless($product->vendor_id === $this->shop->id, 404);

        return $product;
    }

    /**
     * @param  array<string, mixed>  $order
     * @return array<string, mixed>
     */
    private function orderSummary(Order $order): array
    {
        $items = $order->relationLoaded('items')
            ? $order->items
            : $order->items()->where('vendor_id', $this->shop->id)->get();
        $total = (float) $items->sum(fn (OrderItem $item) => (float) $item->line_total);
        $fulfilment = $items->first()?->fulfilment_status;

        return [
            'id' => $order->id,
            'number' => $order->number,
            'customer_name' => $order->customer_name,
            'status' => $order->status->label(),
            'fulfilment' => $fulfilment?->label() ?? 'Pending',
            'items' => $items->count(),
            'total' => Money::format($total),
            'total_amount' => $total,
            'placed_at' => $order->placed_at?->format('d M Y'),
        ];
    }

    /**
     * @param  Collection<int, string>  $extra
     * @param  Collection<int, string>  $uploads
     */
    private function syncImages(Product $product, ?string $primary, Collection $extra, Collection $uploads): void
    {
        $paths = $uploads
            ->merge([$primary])
            ->merge($extra)
            ->filter(fn ($path) => filled($path))
            ->unique()
            ->values();

        if ($paths->isEmpty()) {
            return;
        }

        foreach ($paths as $path) {
            if (str_starts_with((string) $path, 'http://') || str_starts_with((string) $path, 'https://')) {
                validator(['image' => $path], ['image' => ['url', 'max:500']])->validate();
            }
        }

        $product->load('images');

        foreach ($product->images as $image) {
            if (! str_starts_with($image->path, 'http://') && ! str_starts_with($image->path, 'https://')) {
                Storage::disk('public')->delete($image->path);
            }
        }

        $product->images()->delete();

        foreach ($paths as $index => $path) {
            ProductImage::query()->create([
                'product_id' => $product->id,
                'path' => $path,
                'is_primary' => $index === 0,
                'sort_order' => $index,
            ]);
        }
    }

    private function imageUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    private function ownedCoupon(?Coupon $coupon): void
    {
        if ($coupon) {
            abort_unless($coupon->vendor_id === $this->shop->id, 404);
        }
    }

    private function ownedCampaign(?Advertisement $campaign): void
    {
        if ($campaign) {
            abort_unless($campaign->vendor_id === $this->shop->id, 404);
        }
    }

    private function uniqueSlug(string $title, string $model, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'item';
        $slug = $base;
        $i = 1;

        while ($model::query()->where('slug', $slug)->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
