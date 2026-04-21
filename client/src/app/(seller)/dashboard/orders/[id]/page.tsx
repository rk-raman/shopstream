"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import sellerOrderService from "@/features/seller/services/sellerOrderService";
import { toast } from "react-hot-toast";

const STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  pending: { label: "Pending", variant: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Confirmed", variant: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", variant: "bg-yellow-100 text-yellow-700" },
  shipped: { label: "Shipped", variant: "bg-indigo-100 text-indigo-700" },
  out_for_delivery: { label: "Out for Delivery", variant: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", variant: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", variant: "bg-red-100 text-red-700" },
  returned: { label: "Returned", variant: "bg-orange-100 text-orange-700" },
  refunded: { label: "Refunded", variant: "bg-pink-100 text-pink-700" },
};

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
  returned: [],
  refunded: [],
};

export default function SellerOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Tracking update
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  // Return processing
  const [returnAction, setReturnAction] = useState<"approve" | "reject">("approve");
  const [returnNote, setReturnNote] = useState("");
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sellerOrderService.getOrder(orderId);
      if (response.success && response.data?.order) {
        const o = response.data.order;
        setOrder(o);
        setTrackingNumber(o.shipping?.trackingNumber || "");
        setCarrier(o.shipping?.carrier || "");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await sellerOrderService.updateStatus(orderId, newStatus, statusNote);
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label}`);
      setStatusNote("");
      setNewStatus("");
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleTrackingUpdate = async () => {
    setIsUpdatingTracking(true);
    try {
      await sellerOrderService.updateTracking(orderId, {
        trackingNumber,
        carrier,
      });
      toast.success("Tracking info updated");
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleProcessReturn = async () => {
    setIsProcessingReturn(true);
    try {
      await sellerOrderService.processReturn(orderId, returnAction, returnNote);
      toast.success(`Return ${returnAction}d`);
      setReturnNote("");
      fetchOrder();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error || "Order not found"}</p>
          <Link href="/dashboard/orders">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const nextStatuses = NEXT_STATUS[order.status] || [];
  const customer =
    typeof order.customer === "object" ? order.customer : null;
  const addr = order.shippingAddress;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const endpoint = `/orders/${orderId}/invoice`;
                const response = await (await import("@/lib/api/axiosSeller")).default.get(endpoint, {
                  responseType: "blob",
                });
                const blob = new Blob([response.data], { type: "application/pdf" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `invoice-${order.orderNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success("Invoice downloaded");
              } catch {
                toast.error("Failed to download invoice");
              }
            }}
          >
            <Download className="w-4 h-4 mr-1" />
            Invoice
          </Button>
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
              STATUS_CONFIG[order.status]?.variant || "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUS_CONFIG[order.status]?.label || order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items ({order.items?.length || 0})
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any, idx: number) => {
                const img =
                  item.productImage ||
                  (typeof item.product === "object"
                    ? item.product?.images?.[0]?.url
                    : "");
                const name =
                  item.productName ||
                  (typeof item.product === "object" ? item.product?.name : "");
                const effectivePrice = item.discountPrice || item.price;

                return (
                  <div key={item._id || idx} className="flex items-center gap-4 py-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {img ? (
                        <Image
                          src={img}
                          alt={name}
                          width={64}
                          height={64}
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
                        {name}
                      </p>
                      {item.variant?.value && (
                        <p className="text-xs text-gray-500">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} x ₹
                        {effectivePrice?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹
                      {(effectivePrice * item.quantity)?.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Summary */}
            <div className="mt-4 pt-4 border-t space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shippingCharges === 0
                    ? "FREE"
                    : `₹${order.shippingCharges?.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹{order.tax?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </Card>

          {/* Status History */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Status History
            </h2>
            <div className="space-y-3">
              {order.statusHistory?.map((entry: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      idx === 0
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {STATUS_CONFIG[entry.status]?.label || entry.status}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-gray-500">{entry.note}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Update Status */}
          {nextStatuses.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Update Status
              </h3>
              <div className="space-y-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select next status" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_CONFIG[s]?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Add a note (optional)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
                <Button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || isUpdatingStatus}
                  className="w-full"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Update Status
                </Button>
              </div>
            </Card>
          )}

          {/* Tracking Info */}
          {["shipped", "out_for_delivery", "processing"].includes(
            order.status
          ) && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Tracking Information
              </h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Tracking Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Carrier</Label>
                  <Input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g., BlueDart, Delhivery"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleTrackingUpdate}
                  disabled={isUpdatingTracking}
                  variant="outline"
                  className="w-full"
                >
                  {isUpdatingTracking ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save Tracking
                </Button>
              </div>
            </Card>
          )}

          {/* Return Processing */}
          {order.status === "returned" && order.returnReason && (
            <Card className="p-5 border-orange-200">
              <h3 className="text-sm font-semibold text-orange-700 mb-2">
                Return Request
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Reason: {order.returnReason}
              </p>
              <div className="space-y-3">
                <Select
                  value={returnAction}
                  onValueChange={(v: any) => setReturnAction(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve Return</SelectItem>
                    <SelectItem value="reject">Reject Return</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Add a note"
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
                <Button
                  onClick={handleProcessReturn}
                  disabled={isProcessingReturn}
                  variant={returnAction === "approve" ? "default" : "outline"}
                  className="w-full"
                >
                  {isProcessingReturn ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {returnAction === "approve" ? "Approve" : "Reject"} Return
                </Button>
              </div>
            </Card>
          )}

          {/* Customer Info */}
          {customer && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {customer.firstName} {customer.lastName}
                </p>
                <p>{customer.email}</p>
                {customer.phone && <p>{customer.phone}</p>}
              </div>
            </Card>
          )}

          {/* Shipping Address */}
          {addr && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h3>
              <div className="space-y-0.5 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{addr.fullName}</p>
                <p>{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="mt-1">Phone: {addr.phone}</p>
              </div>
            </Card>
          )}

          {/* Payment */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {order.payment?.method === "cod"
                    ? "Cash on Delivery"
                    : order.payment?.method?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span
                  className={`font-medium capitalize ${
                    order.payment?.status === "paid"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.payment?.status}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div className="flex justify-between">
                  <span>Txn ID</span>
                  <span className="font-mono text-xs">
                    {order.payment.transactionId}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
