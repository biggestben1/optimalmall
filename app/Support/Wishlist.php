<?php

namespace App\Support;

use App\Models\Product;

class Wishlist
{
    public const SESSION_KEY = 'wishlist';

    public function toggle(Product $product): bool
    {
        abort_unless($product->status->value === 'active', 404);
        $ids = $this->ids();

        if (in_array($product->id, $ids, true)) {
            $ids = array_values(array_filter($ids, fn (int $id) => $id !== $product->id));
            session([self::SESSION_KEY => $ids]);

            return false;
        }

        $ids[] = $product->id;
        session([self::SESSION_KEY => $ids]);

        return true;
    }

    public function has(int $productId): bool
    {
        return in_array($productId, $this->ids(), true);
    }

    public function count(): int
    {
        return count($this->ids());
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function lines(): array
    {
        $ids = $this->ids();

        if ($ids === []) {
            return [];
        }

        $products = Product::query()
            ->active()
            ->with(['primaryImage', 'images', 'vendor'])
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id');

        $lines = [];
        $kept = [];

        foreach ($ids as $id) {
            $product = $products->get($id);

            if ($product === null) {
                continue;
            }

            $kept[] = $product->id;
            $lines[] = [
                'id' => $product->id,
                'slug' => $product->slug,
                'title' => $product->title,
                'formatted_price' => $product->formattedPrice(),
                'image_url' => $product->primaryImage?->url() ?? $product->images->first()?->url(),
                'vendor' => $product->vendor?->name,
                'in_stock' => $product->inStock(),
            ];
        }

        if ($kept !== $ids) {
            session([self::SESSION_KEY => $kept]);
        }

        return $lines;
    }

    /**
     * @return list<int>
     */
    private function ids(): array
    {
        $ids = session(self::SESSION_KEY, []);

        return is_array($ids) ? array_values(array_map('intval', $ids)) : [];
    }
}
