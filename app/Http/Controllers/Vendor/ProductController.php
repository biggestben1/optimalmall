<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $portal = Portal::current();

        return Inertia::render('Vendor/Products/Index', [
            'products' => $portal->products(
                $request->string('q')->toString(),
                $request->string('status')->toString(),
                $request->string('approval')->toString(),
            ),
            'filters' => $request->only(['q', 'status', 'approval']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vendor/Products/Form', Portal::current()->productForm());
    }

    public function store(Request $request): RedirectResponse
    {
        $product = Portal::current()->saveProduct($request->all());
        $message = $product->approval_status?->value === 'pending'
            ? 'Product submitted for approval.'
            : 'Product saved.';

        return redirect()->route('vendor.products.index')->with('status', $message);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Vendor/Products/Form', Portal::current()->productForm($product));
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product = Portal::current()->saveProduct($request->all(), $product);
        $message = $product->approval_status?->value === 'pending'
            ? 'Product submitted for approval.'
            : 'Product updated.';

        return redirect()->route('vendor.products.index')->with('status', $message);
    }

    public function destroy(Product $product): RedirectResponse
    {
        Portal::current()->deleteProduct($product);

        return redirect()->route('vendor.products.index')->with('status', 'Product deleted.');
    }
}
