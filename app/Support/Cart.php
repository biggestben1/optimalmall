<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Validation\ValidationException;

class Cart
{
    public const SESSION_KEY = 'cart';

    public function add(Product $product, int $quantity): void
    {
        $this->guard($product);
        $items = $this->quantities();
        $next = ($items[$product->id] ?? 0) + $quantity;

        if ($next > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => 'Only '.$product->stock.' available.',
            ]);
        }

        $items[$product->id] = $next;
        session([self::SESSION_KEY => $items]);
    }

    public function update(Product $product, int $quantity): void
    {
        if ($quantity < 1) {
            $this->remove($product);

            return;
        }

        $this->guard($product);

        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => 'Only '.$product->stock.' available.',
            ]);
        }

        $items = $this->quantities();
        $items[$product->id] = $quantity;
        session([self::SESSION_KEY => $items]);
    }

    public function remove(Product $product): void
    {
        $items = $this->quantities();
        unset($items[$product->id]);
        session([self::SESSION_KEY => $items]);
    }

    public function clear(): void
    {
        session()->forget(self::SESSION_KEY);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function lines(): array
    {
        $items = $this->quantities();

        if ($items === []) {
            return [];
        }

        $products = Product::query()
            ->active()
            ->with(['primaryImage', 'images', 'vendor'])
            ->whereIn('id', array_keys($items))
            ->get()
            ->keyBy('id');

        $lines = [];
        $kept = [];

        foreach ($items as $id => $quantity) {
            $product = $products->get($id);

            if ($product === null || ! $product->inStock()) {
                continue;
            }

            $quantity = min((int) $quantity, $product->stock);
            $kept[$product->id] = $quantity;
            $lineTotal = round((float) $product->price * $quantity, 2);

            $lines[] = [
                'id' => $product->id,
                'slug' => $product->slug,
                'title' => $product->title,
                'quantity' => $quantity,
                'stock' => $product->stock,
                'price_label' => $product->formattedPrice(),
                'line_total' => $lineTotal,
                'line_total_label' => Money::format($lineTotal),
                'image_url' => $product->primaryImage?->url() ?? $product->images->first()?->url(),
                'vendor_id' => $product->vendor_id,
                'vendor' => $product->vendor?->name,
            ];
        }

        if ($kept !== $items) {
            session([self::SESSION_KEY => $kept]);
        }

        return $lines;
    }

    /**
     * @return array{count: int, total_label: string}
     */
    public function summary(): array
    {
        $lines = $this->lines();
        $total = array_sum(array_map(fn (array $line) => $line['line_total'], $lines));

        return [
            'count' => array_sum(array_column($lines, 'quantity')),
            'total_label' => Money::format($total),
        ];
    }

    /**
     * @return array<int, int>
     */
    private function quantities(): array
    {
        $items = session(self::SESSION_KEY, []);

        if (! is_array($items)) {
            return [];
        }

        $normalized = [];

        foreach ($items as $id => $quantity) {
            $normalized[(int) $id] = (int) $quantity;
        }

        return $normalized;
    }

    private function guard(Product $product): void
    {
        abort_unless($product->status->value === 'active', 404);

        if (! $product->inStock()) {
            throw ValidationException::withMessages([
                'quantity' => 'This product is out of stock.',
            ]);
        }
    }
}
