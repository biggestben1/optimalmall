<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CouponType;
use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function index(): Response
    {
        $coupons = Coupon::query()
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Coupon $coupon) => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'discount' => $coupon->type === CouponType::Percent
                    ? rtrim(rtrim(number_format((float) $coupon->value, 2), '0'), '.').'%'
                    : Money::format($coupon->value),
                'used' => $coupon->usage_limit
                    ? $coupon->used_count.' / '.$coupon->usage_limit
                    : (string) $coupon->used_count,
                'is_active' => $coupon->is_active,
            ]);

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Coupons/Form', [
            'coupon' => $this->blank(),
            'types' => $this->types(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Coupon::query()->create($this->validated($request));

        return redirect()->route('admin.coupons.index')->with('status', 'Coupon created.');
    }

    public function edit(Coupon $coupon): Response
    {
        return Inertia::render('Admin/Coupons/Form', [
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type->value,
                'value' => $coupon->value,
                'min_order' => $coupon->min_order,
                'usage_limit' => $coupon->usage_limit,
                'starts_at' => $coupon->starts_at?->format('Y-m-d'),
                'ends_at' => $coupon->ends_at?->format('Y-m-d'),
                'is_active' => $coupon->is_active,
            ],
            'types' => $this->types(),
        ]);
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $coupon->update($this->validated($request, $coupon));

        return redirect()->route('admin.coupons.index')->with('status', 'Coupon updated.');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $coupon->delete();

        return redirect()->route('admin.coupons.index')->with('status', 'Coupon deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:40', Rule::unique('coupons', 'code')->ignore($coupon)],
            'type' => ['required', Rule::enum(CouponType::class)],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order' => ['required', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $data['is_active'] = $request->boolean('is_active');
        $data['usage_limit'] = $data['usage_limit'] ?: null;

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function blank(): array
    {
        return [
            'id' => null,
            'code' => '',
            'type' => CouponType::Percent->value,
            'value' => 10,
            'min_order' => 0,
            'usage_limit' => null,
            'starts_at' => null,
            'ends_at' => null,
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
