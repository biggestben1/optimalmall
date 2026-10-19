<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $logs = AuditLog::query()
            ->with(['user:id,name', 'vendor:id,name'])
            ->when($search !== '', fn ($query) => $query->where('action', 'like', "%{$search}%"))
            ->latest()
            ->paginate(30)
            ->withQueryString()
            ->through(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'actor' => $log->user?->name ?? 'System',
                'vendor' => $log->vendor?->name,
                'ip_address' => $log->ip_address,
                'properties' => $log->properties,
                'created_at' => $log->created_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('Admin/Audit/Index', [
            'logs' => $logs,
            'filters' => ['search' => $search],
        ]);
    }
}
