"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Download,
  HelpCircle,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import OrderTracking from "@/features/customer/account/orders/components/OrderTracking";
import OrderStatusBadge from "@/features/customer/account/orders/components/OrderStatusBadge";
import orderService from "@/features/customer/account/orders/services/orderService";
import type { Order } from "@/features/customer/account/orders/types";
import { buildTrackingSteps } from "@/features/customer/account/orders/types";
import { toast } from "react-hot-toast";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrder(orderId);
      if (response.success && response.data?.order) {
        setOrder(response.data.order);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(orderId, cancelReason);
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      fetchOrder(); // Refresh
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-4">
          {error || "Order not found"}
        </p>
        <Link
          href="/account/orders"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const trackingSteps = buildTrackingSteps(order);
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReturn =
    order.status === "delivered" &&
    order.shipping.actualDelivery &&
    Date.now() - new Date(order.shipping.actualDelivery).getTime() <=
      7 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/account/orders"
        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {order.orderNumber}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
            {order.shipping.actualDelivery && order.status === "delivered" && (
              <p className="text-sm text-green-600 mt-1">
                Delivered on {formatDate(order.shipping.actualDelivery)}
              </p>
            )}
            {order.shipping.estimatedDelivery &&
              !["delivered", "cancelled", "returned"].includes(
                order.status
              ) && (
                <p className="text-sm text-gray-500 mt-1">
                  Expected by {formatDate(order.shipping.estimatedDelivery)}
                </p>
              )}
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Order Tracking */}
      <OrderTracking steps={trackingSteps} />

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item, idx) => {
            const imgUrl =
              item.productImage ||
              (typeof item.product === "object"
                ? item.product.images?.[0]?.url
                : "") ||
              "";
            const name =
              item.productName ||
              (typeof item.product === "object" ? item.product.name : "");
            const effectivePrice = item.discountPrice || item.price;

            return (
              <div
                key={item._id || idx}
                className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0"
              >
                <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      N/A
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">{name}</p>
                  {item.variant?.value && (
                    <p className="text-sm text-gray-500">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{(effectivePrice * item.quantity).toLocaleString("en-IN")}
                  </p>
                  {item.discountPrice && item.discountPrice < item.price && (
                    <p className="text-xs text-gray-400 line-through">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Price Breakdown */}
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{order.discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className={order.shippingCharges === 0 ? "text-green-600 font-medium" : ""}>
              {order.shippingCharges === 0
                ? "FREE"
                : `₹${order.shippingCharges.toLocaleString("en-IN")}`}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>₹{order.tax.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Shipping Address
          </h2>
          <div className="space-y-1 text-gray-600">
            <p className="font-semibold text-gray-900">
              {order.shippingAddress.fullName}
            </p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              {order.shippingAddress.pincode}
            </p>
            <p className="mt-2">
              Phone:{" "}
              <span className="font-medium text-gray-900">
                {order.shippingAddress.phone}
              </span>
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Details
          </h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Method</span>
              <span className="font-medium text-gray-900 capitalize">
                {order.payment.method === "cod"
                  ? "Cash on Delivery"
                  : order.payment.method?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span
                className={`font-medium capitalize ${
                  order.payment.status === "paid"
                    ? "text-green-600"
                    : order.payment.status === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {order.payment.status}
              </span>
            </div>
            {order.payment.transactionId && (
              <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="font-mono text-sm text-gray-700">
                  {order.payment.transactionId}
                </span>
              </div>
            )}
          </div>

          {/* Coupon Info */}
          {order.coupon && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-green-600 font-medium">
                Coupon Applied: {order.coupon.code} (-₹
                {order.coupon.discountAmount.toLocaleString("en-IN")})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            <span>Cancel Order</span>
          </button>
        )}
        {canReturn && (
          <button
            onClick={() => {
              toast("Return request feature coming soon");
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 border border-orange-300 text-orange-600 rounded hover:bg-orange-50 transition-colors font-medium"
          >
            <span>Request Return</span>
          </button>
        )}
        <button
          onClick={async () => {
            try {
              await orderService.downloadInvoice(orderId);
              toast.success("Invoice downloaded");
            } catch (err: any) {
              toast.error(err.message || "Failed to download invoice");
            }
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          <span>Download Invoice</span>
        </button>
        <button className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
          <HelpCircle className="w-4 h-4 text-gray-600" />
          <span className="text-gray-600">Need Help?</span>
        </button>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Order
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel order{" "}
              <strong>{order.orderNumber}</strong>? This action cannot be undone.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 mb-4"
              placeholder="Please tell us why you want to cancel..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
