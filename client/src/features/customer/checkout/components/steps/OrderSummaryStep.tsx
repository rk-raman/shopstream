"use client";

import { useState } from "react";
import Image from "next/image";
import { useCheckout } from "../../context/CheckoutContext";
import { Truck, Tag, X } from "lucide-react";

export default function OrderSummaryStep() {
  const { session, applyCoupon, removeCoupon, isLoading, goToStep } =
    useCheckout();
  const [couponCode, setCouponCode] = useState("");

  if (!session) return null;

  const { items, pricing, appliedCoupon, deliveryAddress } = session;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    await applyCoupon(couponCode.trim());
    setCouponCode("");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "5-7 days";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Delivery Info Banner */}
      {deliveryAddress && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded">
          <Truck className="w-4 h-4 text-[#2874f0] flex-shrink-0" />
          <span>
            Delivering to:{" "}
            <strong>
              {deliveryAddress.fullName}, {deliveryAddress.pincode}
            </strong>
          </span>
          <button
            onClick={() => goToStep("address")}
            className="ml-auto text-[#2874f0] text-xs font-semibold"
          >
            Change
          </button>
        </div>
      )}

      {/* Items List */}
      <div className="divide-y divide-gray-100">
        {items.map((item, index) => {
          const effectivePrice = item.discountPrice || item.price;
          const hasDiscount = item.discountPrice && item.discountPrice < item.price;

          return (
            <div key={item._id || index} className="flex gap-4 py-4">
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.productName}
                </h4>

                {item.variant?.value && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-bold text-gray-900">
                    ₹{effectivePrice.toLocaleString("en-IN")}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        {Math.round(
                          ((item.price - effectivePrice) / item.price) * 100
                        )}
                        % off
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Qty: {item.quantity}
                </p>

                {/* Delivery Estimate */}
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <Truck className="w-3 h-3" />
                  <span>
                    Delivery by{" "}
                    <strong className="text-gray-700">
                      {formatDate(item.deliveryEstimate?.date)}
                    </strong>
                  </span>
                  {pricing.deliveryCharge === 0 && (
                    <span className="text-green-600 font-semibold ml-1">
                      FREE
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Section */}
      <div className="border-t pt-4">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {appliedCoupon.code}
              </span>
              <span className="text-sm text-green-600">
                - You save ₹{appliedCoupon.discountAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <button
              onClick={removeCoupon}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#2874f0]"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isLoading || !couponCode.trim()}
              className="px-4 py-2 text-sm font-semibold text-[#2874f0] border border-gray-300 rounded hover:bg-blue-50 disabled:opacity-50"
            >
              APPLY
            </button>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="pt-2">
        <button
          onClick={() => goToStep("payment")}
          className="px-8 py-3 bg-[#fb641b] text-white text-sm font-semibold rounded-sm hover:bg-[#e85d19] transition-colors"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
