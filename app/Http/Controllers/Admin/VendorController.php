<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Enums\VendorStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
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
                'password' => '',
            ],
            'hasLogin' => false,
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $password = $data['password'];
        unset($data['password']);

        DB::transaction(function () use ($data, $password): void {
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $password,
                'role' => UserRole::Vendor,
                'email_verified_at' => now(),
            ]);

            Vendor::query()->create([
                ...$data,
                'user_id' => $user->id,
                'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(3)),
            ]);
        });

        return redirect()->route('admin.vendors.index')->with('status', 'Vendor created. They can sign in with '.$request->string('email').'.');
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
                'password' => '',
            ],
            'hasLogin' => $vendor->user_id !== null,
            'statuses' => $this->statusOptions(),
        ]);
    }

    public function update(Request $request, Vendor $vendor): RedirectResponse
    {
        $data = $this->validated($request, $vendor);
        $password = $data['password'] ?? null;
        unset($data['password']);

        DB::transaction(function () use ($vendor, $data, $password): void {
            $vendor->update($data);
            $this->syncLogin($vendor, $password);
        });

        return redirect()->route('admin.vendors.index')->with('status', 'Vendor updated.');
    }

    public function destroy(Vendor $vendor): RedirectResponse
    {
        $user = $vendor->user;
        $vendor->delete();
        $user?->delete();

        return redirect()->route('admin.vendors.index')->with('status', 'Vendor deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Vendor $vendor = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::enum(VendorStatus::class)],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($vendor?->user_id)],
            'password' => [$vendor?->user_id ? 'nullable' : 'required', 'string', Password::defaults()],
        ]);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        return $data;
    }

    private function syncLogin(Vendor $vendor, ?string $password): void
    {
        $vendor->load('user');
        $user = $vendor->user;

        if ($user === null) {
            $user = User::query()->create([
                'name' => $vendor->name,
                'email' => $vendor->email,
                'password' => $password,
                'role' => UserRole::Vendor,
                'email_verified_at' => now(),
            ]);
            $vendor->update(['user_id' => $user->id]);

            return;
        }

        $user->fill([
            'name' => $vendor->name,
            'email' => $vendor->email,
            'role' => UserRole::Vendor,
        ]);

        if (filled($password)) {
            $user->password = $password;
        }

        $user->save();
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
