<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\SupportTicket;
use App\Services\Vendor\Portal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorPortalController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json(Portal::current()->dashboard());
    }

    public function store(): JsonResponse
    {
        return response()->json(Portal::current()->shopPayload());
    }

    public function updateStore(Request $request): JsonResponse
    {
        Portal::current()->updateShop($request->all());

        return response()->json(Portal::current()->shopPayload());
    }

    public function products(Request $request): JsonResponse
    {
        return response()->json(Portal::current()->products(
            $request->string('search')->toString() ?: $request->string('q')->toString(),
            $request->string('status')->toString(),
            $request->string('approval')->toString(),
        ));
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $product = Portal::current()->saveProduct($request->all());

        return response()->json($product->only(['id', 'title', 'status', 'approval_status']), 201);
    }

    public function updateProduct(Request $request, Product $product): JsonResponse
    {
        $product = Portal::current()->saveProduct($request->all(), $product);

        return response()->json($product->only(['id', 'title', 'status', 'approval_status']));
    }

    public function destroyProduct(Product $product): JsonResponse
    {
        Portal::current()->deleteProduct($product);

        return response()->json(['message' => 'Product deleted.']);
    }

    public function inventory(Request $request): JsonResponse
    {
        return response()->json(Portal::current()->inventory(
            $request->string('q')->toString(),
            $request->boolean('low'),
        ));
    }

    public function updateInventory(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate(['stock' => ['required', 'integer', 'min:0']]);
        Portal::current()->adjustStock($product, (int) $data['stock']);

        return response()->json(['id' => $product->id, 'stock' => (int) $data['stock']]);
    }

    public function orders(Request $request): JsonResponse
    {
        return response()->json(Portal::current()->orders(
            $request->string('q')->toString(),
            $request->string('status')->toString(),
        ));
    }

    public function showOrder(Order $order): JsonResponse
    {
        return response()->json(Portal::current()->orderDetail($order));
    }

    public function updateOrder(Request $request, Order $order): JsonResponse
    {
        Portal::current()->updateFulfilment($order, $request->all());

        return response()->json(Portal::current()->orderDetail($order));
    }

    public function finance(): JsonResponse
    {
        return response()->json(Portal::current()->finance());
    }

    public function payouts(): JsonResponse
    {
        return response()->json(Portal::current()->payouts());
    }

    public function storePayout(Request $request): JsonResponse
    {
        $payout = Portal::current()->requestPayout($request->all());

        return response()->json($payout->only(['id', 'reference', 'amount', 'status']), 201);
    }

    public function updateBank(Request $request): JsonResponse
    {
        $bank = Portal::current()->saveBank($request->all());

        return response()->json($bank->only(['id', 'bank_name', 'account_name', 'account_number']));
    }

    public function coupons(): JsonResponse
    {
        return response()->json(Portal::current()->coupons());
    }

    public function storeCoupon(Request $request): JsonResponse
    {
        $coupon = Portal::current()->saveCoupon($request->all());

        return response()->json($coupon->only(['id', 'code']), 201);
    }

    public function updateCoupon(Request $request, Coupon $coupon): JsonResponse
    {
        $coupon = Portal::current()->saveCoupon($request->all(), $coupon);

        return response()->json($coupon->only(['id', 'code']));
    }

    public function destroyCoupon(Coupon $coupon): JsonResponse
    {
        Portal::current()->deleteCoupon($coupon);

        return response()->json(['message' => 'Discount deleted.']);
    }

    public function campaigns(): JsonResponse
    {
        return response()->json(Portal::current()->campaigns());
    }

    public function storeCampaign(Request $request): JsonResponse
    {
        $campaign = Portal::current()->saveCampaign($request->all());

        return response()->json($campaign->only(['id', 'title']), 201);
    }

    public function updateCampaign(Request $request, Advertisement $campaign): JsonResponse
    {
        $campaign = Portal::current()->saveCampaign($request->all(), $campaign);

        return response()->json($campaign->only(['id', 'title']));
    }

    public function destroyCampaign(Advertisement $campaign): JsonResponse
    {
        Portal::current()->deleteCampaign($campaign);

        return response()->json(['message' => 'Campaign deleted.']);
    }

    public function reviews(Request $request): JsonResponse
    {
        return response()->json(Portal::current()->reviews($request->string('q')->toString()));
    }

    public function replyReview(Request $request, Review $review): JsonResponse
    {
        Portal::current()->replyToReview($review, (string) $request->input('reply'));

        return response()->json(['message' => 'Reply saved.']);
    }

    public function tickets(Request $request): JsonResponse
    {
        return response()->json(Portal::current()->tickets($request->string('status')->toString()));
    }

    public function storeTicket(Request $request): JsonResponse
    {
        $ticket = Portal::current()->openTicket($request->all());

        return response()->json(Portal::current()->ticketDetail($ticket), 201);
    }

    public function showTicket(SupportTicket $ticket): JsonResponse
    {
        return response()->json(Portal::current()->ticketDetail($ticket));
    }

    public function replyTicket(Request $request, SupportTicket $ticket): JsonResponse
    {
        Portal::current()->replyToTicket($ticket, (string) $request->input('body'));

        return response()->json(Portal::current()->ticketDetail($ticket));
    }

    public function notifications(): JsonResponse
    {
        return response()->json(Portal::current()->notifications());
    }

    public function readNotifications(): JsonResponse
    {
        Portal::current()->markNotificationsRead();

        return response()->json(['message' => 'Notifications marked as read.']);
    }

    public function reports(): JsonResponse
    {
        return response()->json(Portal::current()->reports());
    }

    public function updateAccount(Request $request): JsonResponse
    {
        Portal::current()->updateAccount($request->all());

        return response()->json(['message' => 'Account saved.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        Portal::current()->updatePassword($request->all());

        return response()->json(['message' => 'Password updated.']);
    }
}
