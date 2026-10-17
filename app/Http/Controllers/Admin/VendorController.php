<?php

namespace App\Http\Controllers\Admin;

use App\Enums\VendorStatus;
use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(): Response
    {
        $vendors = Vendor::query()
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Vendor $vendor) => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'city' => $vendor->city,
                'state' => $vendor->state,
                'status_label' => $vendor->status->label(),
            ]);

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Vendors/Form', [
            'vendor' => [
                'id' => null,
                'name' => '',
                'description' => '',
                'status' => VendorStatus::Pending->value,
                'city' => '',
                'state' => '',
                'phone' => '',
                'email' => '',
            ],
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = Str::slug($data['name']).'-'.Str::lower(Str::random(3));
        Vendor::query()->create($data);

        return redirect()->route('admin.vendors.index')->with('status', 'Vendor created.');
    }

    public function edit(Vendor $vendor): Response
    {
        return Inertia::render('Admin/Vendors/Form', [
            'vendor' => [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'description' => $vendor->description,
                'status' => $vendor->status->value,
                'city' => $vendor->city,
                'state' => $vendor->state,
                'phone' => $vendor->phone,
                'email' => $vendor->email,
            ],
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function update(Request $request, Vendor $vendor): RedirectResponse
    {
        $vendor->update($this->validated($request));

        return redirect()->route('admin.vendors.index')->with('status', 'Vendor updated.');
    }

    public function destroy(Vendor $vendor): RedirectResponse
    {
        $vendor->delete();

        return redirect()->route('admin.vendors.index')->with('status', 'Vendor deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::enum(VendorStatus::class)],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return collect(VendorStatus::cases())
            ->map(fn (VendorStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])
            ->values()
            ->all();
    }
}
