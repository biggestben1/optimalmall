<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Services\Vendor\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $tickets = SupportTicket::query()
            ->with('vendor:id,name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('subject', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (SupportTicket $ticket) => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'vendor' => $ticket->vendor?->name,
                'customer' => $ticket->customer_name,
                'status' => $ticket->status->value,
                'status_label' => $ticket->status->label(),
            ]);

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'filters' => ['search' => $search, 'status' => $request->string('status')->toString()],
            'statuses' => collect(TicketStatus::cases())->map(fn (TicketStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
        ]);
    }

    public function show(SupportTicket $ticket): Response
    {
        $ticket->load(['vendor:id,name', 'messages.user:id,name']);

        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'vendor' => $ticket->vendor?->name,
                'customer' => $ticket->customer_name,
                'email' => $ticket->customer_email,
                'status' => $ticket->status->value,
                'messages' => $ticket->messages->map(fn ($message) => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'author' => $message->user?->name ?? 'Seller',
                    'at' => $message->created_at?->format('d M Y H:i'),
                ]),
            ],
            'statuses' => collect(TicketStatus::cases())->map(fn (TicketStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
        ]);
    }

    public function update(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(TicketStatus::class)],
            'body' => ['nullable', 'string', 'max:5000'],
        ]);

        $ticket->update(['status' => $data['status']]);

        if (filled($data['body'] ?? null)) {
            $ticket->messages()->create([
                'user_id' => $request->user()->id,
                'body' => $data['body'],
            ]);
            $ticket->vendor?->notifyPortal('Support reply', $ticket->subject);
        }

        AuditLogger::record('ticket.updated', $ticket, ['status' => $data['status']], $ticket->vendor);

        return back()->with('status', 'Ticket updated.');
    }
}
