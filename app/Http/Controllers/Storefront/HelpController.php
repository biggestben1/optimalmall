<?php

namespace App\Http\Controllers\Storefront;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HelpController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Storefront/Help');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $ticket = SupportTicket::query()->create([
            'vendor_id' => null,
            'subject' => $data['subject'],
            'status' => TicketStatus::Open,
            'customer_name' => $data['name'],
            'customer_email' => $data['email'],
        ]);

        TicketMessage::query()->create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $request->user()?->id,
            'body' => $data['message'],
        ]);

        return back()->with('status', 'Message received. The mall team will reply by email.');
    }
}
