"use client";

import { useCheckout } from "../../context/CheckoutContext";
import { ShieldCheck, Tag } from "lucide-react";

export default function PriceDetails() {
  const { session } = useCheckout();

  if (!session) {
    return (
      <div className="bg-white shadow-sm rounded-sm p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const { pricing, items, appliedCoupon } = session;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const originalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const productDiscount = originalPrice - pricing.subtotal;
  const totalSaved = productDiscount + pricing.discount;

  return (
    <div className="bg-white shadow-sm rounded-sm sticky top-4">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-500 uppercase">
          Price Details
        </h3>
      </div>

      {/* Price Breakdown */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">
            Price ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <span className="text-gray-900">
            ₹{originalPrice.toLocaleString("en-IN")}
          </span>
        </div>

        {productDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Discount</span>
            <span className="text-green-600">
              -₹{productDiscount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {appliedCoupon && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Coupon ({appliedCoupon.code})
            </span>
            <span className="text-green-600">
              -₹{appliedCoupon.discountAmount.toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Delivery Charges</span>
          {pricing.deliveryCharge === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            <span className="text-gray-900">
              ₹{pricing.deliveryCharge.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">GST (18%)</span>
          <span className="text-gray-900">
            ₹{pricing.tax.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="px-6 py-4 border-t border-dashed border-gray-300">
        <div className="flex items-center justify-between text-base font-bold">
          <span className="text-gray-900">Total Amount</span>
          <span className="text-gray-900">
            ₹{pricing.total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Savings */}
      {totalSaved > 0 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-green-600 font-semibold">
            You will save ₹{totalSaved.toLocaleString("en-IN")} on this order
          </p>
        </div>
      )}

      {/* Trust Badges */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-8 h-8 text-gray-300 flex-shrink-0" />
          <span>
            Safe and Secure Payments. Easy returns. 100% Authentic products.
          </span>
        </div>
      </div>
    </div>
  );
}
