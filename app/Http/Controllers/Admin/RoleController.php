<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Vendor\AuditLogger;
use App\Support\AdminAccess;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'can_delete' => $this->canDelete($user),
            ]);

        return Inertia::render('Admin/Roles/Index', [
            'users' => $users,
            'roles' => $this->roles(),
            'permissions' => collect(AdminAccess::grants())->map(fn (array $modules, string $role) => [
                'role' => $role,
                'modules' => $modules,
            ])->values(),
            'modules' => AdminAccess::modules(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        $staff = User::query()->create([
            ...$data,
            'email_verified_at' => now(),
        ]);
        AuditLogger::record('staff.created', $staff, ['role' => $staff->role->value]);

        return redirect()->route('admin.roles.index')->with('status', 'Staff account created.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Roles/Edit', [
            'staff' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ],
            'roles' => $this->roles(),
            'can_delete' => $this->canDelete($user),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::enum(UserRole::class)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $nextRole = UserRole::from($data['role']);
        $this->guardLastSuperAdmin($user, $nextRole);

        $changes = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $nextRole,
        ];

        if (filled($data['password'] ?? null)) {
            $changes['password'] = $data['password'];
        }

        $user->update($changes);
        AuditLogger::record('staff.updated', $user, [
            'role' => $nextRole->value,
            'password_changed' => filled($data['password'] ?? null),
        ]);

        return redirect()->route('admin.roles.index')->with('status', 'Staff account updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->with('error', 'You cannot delete the account you are signed in with.');
        }

        if (! $this->canDelete($user)) {
            return back()->with('error', 'Keep at least one super admin.');
        }

        AuditLogger::record('staff.deleted', $user, [
            'email' => $user->email,
            'role' => $user->role->value,
        ]);
        $user->delete();

        return redirect()->route('admin.roles.index')->with('status', 'Account deleted.');
    }

    private function canDelete(User $user): bool
    {
        if ($user->is(auth()->user())) {
            return false;
        }

        if (! $user->isSuperAdmin()) {
            return true;
        }

        return User::query()->where('role', UserRole::SuperAdmin)->whereKeyNot($user->id)->exists();
    }

    private function guardLastSuperAdmin(User $user, ?UserRole $nextRole): void
    {
        $removingAdmin = $user->isSuperAdmin() && $nextRole !== UserRole::SuperAdmin;

        if (! $removingAdmin) {
            return;
        }

        $remaining = User::query()
            ->where('role', UserRole::SuperAdmin)
            ->whereKeyNot($user->id)
            ->exists();

        if (! $remaining) {
            throw ValidationException::withMessages([
                'role' => 'Keep at least one super admin.',
            ]);
        }
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function roles(): array
    {
        return collect(UserRole::cases())->map(fn (UserRole $role) => [
            'value' => $role->value,
            'label' => $role->label(),
        ])->all();
    }
}
