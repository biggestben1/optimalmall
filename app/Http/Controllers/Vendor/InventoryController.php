<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Vendor/Inventory/Index', [
            'products' => Portal::current()->inventory(
                $request->string('q')->toString(),
                $request->boolean('low'),
            ),
            'filters' => [
                'q' => $request->string('q')->toString(),
                'low' => $request->boolean('low'),
            ],
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        Portal::current()->adjustStock($product, (int) $data['stock']);

        return back()->with('status', 'Stock updated.');
    }
}
