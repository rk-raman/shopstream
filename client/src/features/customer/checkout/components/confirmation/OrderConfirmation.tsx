"use client";

import Image from "next/image";
import Link from "next/link";
import { useCheckout } from "../../context/CheckoutContext";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export default function OrderConfirmation() {
  const { orderData, session } = useCheckout();

  if (!orderData || !session) return null;

  const { deliveryAddress, pricing } = session;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "5-7 business days";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-[60vh] max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="bg-white shadow-sm rounded-sm p-8 text-center mb-4">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 text-sm">
          Your order{" "}
          <strong className="text-gray-700">
            #{orderData.orderNumber || orderData._id?.slice(-8).toUpperCase()}
          </strong>{" "}
          has been placed.
        </p>
      </div>

      {/* Order Details */}
      <div className="bg-white shadow-sm rounded-sm mb-4">
        {/* Items */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
            <Package className="w-4 h-4" />
            Order Items
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {session.items.map((item, index) => (
            <div key={index} className="flex items-center gap-4 px-6 py-3">
              <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    N/A
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.productName}
                </p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                ₹
                {(
                  (item.discountPrice || item.price) * item.quantity
                ).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{pricing.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {pricing.discount > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">
                -₹{pricing.discount.toLocaleString("en-IN")}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Delivery</span>
            <span>
              {pricing.deliveryCharge === 0
                ? "FREE"
                : `₹${pricing.deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Tax</span>
            <span>₹{pricing.tax.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
            <span>Total Paid</span>
            <span>₹{pricing.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Delivery & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Delivery Address */}
        <div className="bg-white shadow-sm rounded-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            Delivery Address
          </h3>
          {deliveryAddress && (
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-semibold text-gray-900">
                {deliveryAddress.fullName}
              </p>
              <p>{deliveryAddress.addressLine1}</p>
              {deliveryAddress.addressLine2 && (
                <p>{deliveryAddress.addressLine2}</p>
              )}
              <p>
                {deliveryAddress.city}, {deliveryAddress.state} -{" "}
                {deliveryAddress.pincode}
              </p>
              <p>Phone: {deliveryAddress.phone}</p>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white shadow-sm rounded-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4" />
            Payment Method
          </h3>
          <p className="text-sm text-gray-600 capitalize">
            {session.selectedPaymentMethod === "cod"
              ? "Cash on Delivery"
              : session.selectedPaymentMethod?.toUpperCase()}
          </p>

          <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2 mt-4 mb-3">
            <Truck className="w-4 h-4" />
            Estimated Delivery
          </h3>
          <p className="text-sm text-gray-600">
            {formatDate(session.items[0]?.deliveryEstimate?.date)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/account/orders"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2874f0] text-white text-sm font-semibold rounded-sm hover:bg-[#1a65d6] transition-colors"
        >
          View Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/shop/products"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-sm hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
