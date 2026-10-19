<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Services\Vendor\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $brands = Brand::query()
            ->withCount('products')
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Brand $brand) => [
                'id' => $brand->id,
                'name' => $brand->name,
                'products_count' => $brand->products_count,
                'is_active' => $brand->is_active,
            ]);

        return Inertia::render('Admin/Brands/Index', [
            'brands' => $brands,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Brands/Form', [
            'brand' => ['id' => null, 'name' => '', 'description' => '', 'is_active' => true],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $brand = Brand::query()->create($this->validated($request));
        AuditLogger::record('brand.created', $brand, ['name' => $brand->name]);

        return redirect()->route('admin.brands.index')->with('status', 'Brand created.');
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('Admin/Brands/Form', [
            'brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'description' => $brand->description,
                'is_active' => $brand->is_active,
            ],
        ]);
    }

    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $brand->update($this->validated($request, $brand));
        AuditLogger::record('brand.updated', $brand, ['name' => $brand->name]);

        return redirect()->route('admin.brands.index')->with('status', 'Brand updated.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        AuditLogger::record('brand.deleted', $brand, ['name' => $brand->name]);
        $brand->delete();

        return redirect()->route('admin.brands.index')->with('status', 'Brand deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Brand $brand = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($brand?->id)],
        ]);

        $data['slug'] = Str::slug($data['slug'] ?? $data['name']) ?: 'brand';
        $data['is_active'] = $request->boolean('is_active');

        return $data;
    }
}
