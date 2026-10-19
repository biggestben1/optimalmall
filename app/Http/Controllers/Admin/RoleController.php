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

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'role' => ['required', Rule::enum(UserRole::class)],
        ]);

        $nextRole = UserRole::from($data['role']);

        if ($user->isSuperAdmin() && $nextRole !== UserRole::SuperAdmin) {
            $remaining = User::query()
                ->where('role', UserRole::SuperAdmin)
                ->whereKeyNot($user->id)
                ->exists();

            if (! $remaining) {
                return redirect()->route('admin.roles.index')->with('status', 'Keep at least one super admin.');
            }
        }

        $user->update(['role' => $nextRole]);
        AuditLogger::record('staff.role_changed', $user, ['role' => $nextRole->value]);

        return redirect()->route('admin.roles.index')->with('status', 'Role updated.');
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
