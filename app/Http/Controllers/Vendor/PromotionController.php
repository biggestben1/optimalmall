<?php

namespace App\Http\Controllers\Vendor;

use App\Enums\CouponType;
use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Coupon;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(): Response
    {
        $portal = Portal::current();

        return Inertia::render('Vendor/Promotions/Index', [
            'coupons' => $portal->coupons(),
            'campaigns' => $portal->campaigns(),
        ]);
    }

    public function createCoupon(): Response
    {
        return Inertia::render('Vendor/Promotions/CouponForm', [
            'coupon' => $this->blankCoupon(),
            'types' => $this->types(),
        ]);
    }

    public function storeCoupon(Request $request): RedirectResponse
    {
        Portal::current()->saveCoupon($request->all());

        return redirect()->route('vendor.promotions.index')->with('status', 'Discount saved.');
    }

    public function editCoupon(Coupon $coupon): Response
    {
        abort_unless($coupon->vendor_id === Portal::current()->shop->id, 404);

        return Inertia::render('Vendor/Promotions/CouponForm', [
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type->value,
                'value' => $coupon->value,
                'min_order' => $coupon->min_order,
                'usage_limit' => $coupon->usage_limit,
                'starts_at' => $coupon->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $coupon->ends_at?->format('Y-m-d\TH:i'),
                'is_active' => $coupon->is_active,
            ],
            'types' => $this->types(),
        ]);
    }

    public function updateCoupon(Request $request, Coupon $coupon): RedirectResponse
    {
        Portal::current()->saveCoupon($request->all(), $coupon);

        return redirect()->route('vendor.promotions.index')->with('status', 'Discount updated.');
    }

    public function destroyCoupon(Coupon $coupon): RedirectResponse
    {
        Portal::current()->deleteCoupon($coupon);

        return redirect()->route('vendor.promotions.index')->with('status', 'Discount deleted.');
    }

    public function createCampaign(): Response
    {
        return Inertia::render('Vendor/Promotions/CampaignForm', [
            'campaign' => [
                'id' => null,
                'title' => '',
                'placement' => 'homepage',
                'image_path' => '',
                'link_url' => '',
                'budget' => '',
                'starts_at' => '',
                'ends_at' => '',
                'is_active' => true,
            ],
        ]);
    }

    public function storeCampaign(Request $request): RedirectResponse
    {
        Portal::current()->saveCampaign($request->all());

        return redirect()->route('vendor.promotions.index')->with('status', 'Campaign saved.');
    }

    public function editCampaign(Advertisement $campaign): Response
    {
        abort_unless($campaign->vendor_id === Portal::current()->shop->id, 404);

        return Inertia::render('Vendor/Promotions/CampaignForm', [
            'campaign' => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'placement' => $campaign->placement,
                'image_path' => $campaign->image_path,
                'link_url' => $campaign->link_url,
                'budget' => $campaign->budget,
                'starts_at' => $campaign->starts_at?->format('Y-m-d'),
                'ends_at' => $campaign->ends_at?->format('Y-m-d'),
                'is_active' => $campaign->is_active,
            ],
        ]);
    }

    public function updateCampaign(Request $request, Advertisement $campaign): RedirectResponse
    {
        Portal::current()->saveCampaign($request->all(), $campaign);

        return redirect()->route('vendor.promotions.index')->with('status', 'Campaign updated.');
    }

    public function destroyCampaign(Advertisement $campaign): RedirectResponse
    {
        Portal::current()->deleteCampaign($campaign);

        return redirect()->route('vendor.promotions.index')->with('status', 'Campaign deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function blankCoupon(): array
    {
        return [
            'id' => null,
            'code' => '',
            'type' => CouponType::Percent->value,
            'value' => '',
            'min_order' => '',
            'usage_limit' => '',
            'starts_at' => '',
            'ends_at' => '',
            'is_active' => true,
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function types(): array
    {
        return collect(CouponType::cases())->map(fn (CouponType $type) => [
            'value' => $type->value,
            'label' => $type->label(),
        ])->all();
    }
}
