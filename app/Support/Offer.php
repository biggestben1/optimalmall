<?php

namespace App\Support;

use App\Enums\CouponType;
use App\Models\Coupon;
use Illuminate\Validation\ValidationException;

class Offer
{
    public const SESSION_KEY = 'coupon_code';

    public function remember(string $code): Coupon
    {
        $coupon = $this->find($code);

        if ($coupon === null) {
            throw ValidationException::withMessages([
                'code' => 'That coupon is not active.',
            ]);
        }

        session([self::SESSION_KEY => $coupon->code]);

        return $coupon;
    }

    public function forget(): void
    {
        session()->forget(self::SESSION_KEY);
    }

    public function coupon(): ?Coupon
    {
        $code = session(self::SESSION_KEY);

        if (! is_string($code) || $code === '') {
            return null;
        }

        $coupon = $this->find($code);

        if ($coupon === null) {
            $this->forget();
        }

        return $coupon;
    }

    /**
     * @param  list<array<string, mixed>>  $lines
     * @return array{discount: float, code: ?string, message: ?string, lines: list<array<string, mixed>>}
     */
    public function apply(array $lines): array
    {
        $coupon = $this->coupon();
        $adjusted = $lines;

        if ($coupon === null) {
            return ['discount' => 0.0, 'code' => null, 'message' => null, 'lines' => $adjusted];
        }

        $eligibleIndexes = [];
        $eligible = 0.0;

        foreach ($adjusted as $index => $line) {
            if ($coupon->vendor_id === null || (int) $coupon->vendor_id === (int) ($line['vendor_id'] ?? 0)) {
                $eligibleIndexes[] = $index;
                $eligible += (float) $line['line_total'];
            }
        }

        $eligible = round($eligible, 2);

        if ($eligible <= 0) {
            return ['discount' => 0.0, 'code' => $coupon->code, 'message' => 'This coupon does not match the shops in your cart.', 'lines' => $adjusted];
        }

        if ($eligible + 0.009 < (float) $coupon->min_order) {
            return ['discount' => 0.0, 'code' => $coupon->code, 'message' => 'Add more from this shop to reach the coupon minimum.', 'lines' => $adjusted];
        }

        $discount = $coupon->type === CouponType::Percent
            ? round($eligible * min((float) $coupon->value, 100) / 100, 2)
            : round(min((float) $coupon->value, $eligible), 2);

        $remaining = $discount;

        foreach ($eligibleIndexes as $position => $index) {
            $share = $position === array_key_last($eligibleIndexes)
                ? $remaining
                : round($discount * ((float) $adjusted[$index]['line_total'] / $eligible), 2);
            $share = min($share, (float) $adjusted[$index]['line_total'], $remaining);
            $adjusted[$index]['line_total'] = round((float) $adjusted[$index]['line_total'] - $share, 2);
            $adjusted[$index]['line_total_label'] = Money::format($adjusted[$index]['line_total']);
            $remaining = round($remaining - $share, 2);
        }

        return ['discount' => $discount, 'code' => $coupon->code, 'message' => null, 'lines' => $adjusted];
    }

    private function find(string $code): ?Coupon
    {
        $coupon = Coupon::query()
            ->whereRaw('upper(code) = ?', [strtoupper(trim($code))])
            ->first();

        if ($coupon === null || ! $coupon->is_active) {
            return null;
        }

        if ($coupon->starts_at !== null && $coupon->starts_at->isFuture()) {
            return null;
        }

        if ($coupon->ends_at !== null && $coupon->ends_at->isPast()) {
            return null;
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return null;
        }

        return $coupon;
    }
}
