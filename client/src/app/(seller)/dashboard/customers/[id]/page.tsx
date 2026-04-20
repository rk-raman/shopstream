"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  IndianRupee,
  Calendar,
  TrendingUp,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import sellerCustomerService from "@/features/seller/services/sellerCustomerService";

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

export default function SellerCustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sellerCustomerService.getCustomer(
        customerId,
        page
      );
      if (response.success && response.data) {
        setCustomer(response.data.customer);
        setStats(response.data.stats);
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (isLoading && !customer) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error || "Customer not found"}</p>
          <Link href="/dashboard/customers">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const defaultAddress = customer.addresses?.find(
    (a: any) => a.isDefault
  ) || customer.addresses?.[0];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </Link>

      {/* Customer Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {customer.avatar?.url ? (
              <img
                src={customer.avatar.url}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {customer.phone}
                </span>
              )}
              {customer.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {formatDate(customer.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders || 0}
                </p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{(stats.totalSpent || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Math.round(stats.avgOrderValue || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-500">Avg Order Value</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {stats.lastOrder ? formatDate(stats.lastOrder) : "—"}
                </p>
                <p className="text-xs text-gray-500">Last Order</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order History — Left Column */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order History
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No orders found for this customer.
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {orders.map((order: any) => (
                    <Link
                      key={order._id}
                      href={`/dashboard/orders/${order._id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Items preview */}
                      <div className="flex -space-x-2 flex-shrink-0">
                        {order.items?.slice(0, 2).map((item: any, i: number) => {
                          const img =
                            item.productImage ||
                            (typeof item.product === "object"
                              ? item.product?.images?.[0]?.url
                              : "");
                          return img ? (
                            <Image
                              key={i}
                              src={img}
                              alt=""
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                          ) : (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-500"
                            >
                              {(item.productName || "?")[0]}
                            </div>
                          );
                        })}
                      </div>

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items?.length} item
                          {order.items?.length !== 1 ? "s" : ""} ·{" "}
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            STATUS_CONFIG[order.status]?.variant ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STATUS_CONFIG[order.status]?.label || order.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50">
                    <span className="text-xs text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Right Column — Address & Info */}
        <div className="space-y-6">
          {/* Default Address */}
          {defaultAddress && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Default Address
              </h3>
              <div className="space-y-0.5 text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {defaultAddress.fullName}
                </p>
                <p>{defaultAddress.addressLine1}</p>
                {defaultAddress.addressLine2 && (
                  <p>{defaultAddress.addressLine2}</p>
                )}
                <p>
                  {defaultAddress.city}, {defaultAddress.state} -{" "}
                  {defaultAddress.pincode}
                </p>
                {defaultAddress.phone && (
                  <p className="mt-1">Phone: {defaultAddress.phone}</p>
                )}
              </div>
            </Card>
          )}

          {/* All Addresses */}
          {customer.addresses?.length > 1 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                All Addresses ({customer.addresses.length})
              </h3>
              <div className="space-y-3">
                {customer.addresses
                  .filter((a: any) => a._id !== defaultAddress?._id)
                  .map((addr: any) => (
                    <div
                      key={addr._id}
                      className="text-xs text-gray-500 border-t pt-3"
                    >
                      <p className="font-medium text-gray-700">
                        {addr.fullName}
                      </p>
                      <p>
                        {addr.addressLine1}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Activity */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Activity
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              {stats?.firstOrder && (
                <div className="flex justify-between">
                  <span>First Order</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(stats.firstOrder)}
                  </span>
                </div>
              )}
              {stats?.lastOrder && (
                <div className="flex justify-between">
                  <span>Last Order</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(stats.lastOrder)}
                  </span>
                </div>
              )}
              {customer.lastActiveAt && (
                <div className="flex justify-between">
                  <span>Last Active</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(customer.lastActiveAt)}
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
