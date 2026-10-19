<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReturnStatus;
use App\Http\Controllers\Controller;
use App\Models\OrderReturn;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function index(): Response
    {
        $returns = OrderReturn::query()
            ->with('order')
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (OrderReturn $return) => [
                'id' => $return->id,
                'order_number' => $return->order?->number,
                'reason' => $return->reason,
                'refund_amount' => Money::format($return->refund_amount),
                'status' => $return->status->value,
                'status_label' => $return->status->label(),
                'notes' => $return->notes,
            ]);

        return Inertia::render('Admin/Returns/Index', [
            'returns' => $returns,
            'statuses' => collect(ReturnStatus::cases())->map(fn (ReturnStatus $status) => [
                'value' => $status->value,
                'label' => $status->label(),
            ])->values(),
        ]);
    }

    public function update(Request $request, OrderReturn $orderReturn): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(ReturnStatus::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $orderReturn->update($data);

        return redirect()->route('admin.returns.index')->with('status', 'Return updated.');
    }
}
