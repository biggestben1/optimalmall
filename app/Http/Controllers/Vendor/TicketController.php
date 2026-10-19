<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Services\Vendor\Portal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Vendor/Messages/Index', [
            'tickets' => Portal::current()->tickets($request->string('status')->toString()),
            'filters' => $request->only(['status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vendor/Messages/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $ticket = Portal::current()->openTicket($request->all());

        return redirect()->route('vendor.tickets.show', $ticket)->with('status', 'Message sent.');
    }

    public function show(SupportTicket $ticket): Response
    {
        return Inertia::render('Vendor/Messages/Show', [
            'ticket' => Portal::current()->ticketDetail($ticket),
        ]);
    }

    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        Portal::current()->replyToTicket($ticket, (string) $request->input('body'));

        return back()->with('status', 'Reply sent.');
    }
}
