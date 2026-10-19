<?php

return [

    /*
    | Platform commission taken from a vendor's paid line totals.
    | A shop can override this with vendors.commission_rate.
    */
    'commission_rate' => (float) env('MARKETPLACE_COMMISSION_RATE', 10),

    /*
    | When true, a vendor cannot publish a product until an admin approves it.
    */
    'require_product_approval' => (bool) env('MARKETPLACE_REQUIRE_PRODUCT_APPROVAL', true),

];
