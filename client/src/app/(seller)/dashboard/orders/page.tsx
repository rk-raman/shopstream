"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import sellerOrderService from "@/features/seller/services/sellerOrderService";
import { toast } from "react-hot-toast";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

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

// Allowed next statuses for seller
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

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sellerOrderService.getMyOrders({
        page,
        limit: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy,
        sortOrder,
      });
      if (response.success && response.data) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      await sellerOrderService.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${STATUS_CONFIG[newStatus]?.label}`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(term) ||
      order.customer?.firstName?.toLowerCase().includes(term) ||
      order.customer?.lastName?.toLowerCase().includes(term) ||
      order.customer?.email?.toLowerCase().includes(term)
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} order{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by order number, customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchOrders} variant="outline">
            Retry
          </Button>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-16 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== "all"
              ? "No orders match your filters"
              : "No orders yet"}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSort("totalAmount")}
                  >
                    <span className="flex items-center gap-1">
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSort("createdAt")}
                  >
                    <span className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const customerName =
                    typeof order.customer === "object"
                      ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
                      : "N/A";
                  const nextStatuses = NEXT_STATUS[order.status] || [];

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Order Number */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="text-sm font-semibold text-blue-600 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {customerName}
                        </p>
                        {typeof order.customer === "object" && (
                          <p className="text-xs text-gray-500">
                            {order.customer.email}
                          </p>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {order.items?.slice(0, 3).map((item: any, i: number) => {
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
                                  width={28}
                                  height={28}
                                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                                />
                              ) : (
                                <div
                                  key={i}
                                  className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-500"
                                >
                                  {(item.productName || "?")[0]}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-xs text-gray-500">
                            {order.items?.length || 0} item
                            {order.items?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-xs font-medium text-gray-700 capitalize">
                            {order.payment?.method === "cod"
                              ? "COD"
                              : order.payment?.method?.toUpperCase()}
                          </span>
                          <br />
                          <span
                            className={`text-xs capitalize ${
                              order.payment?.status === "paid"
                                ? "text-green-600"
                                : order.payment?.status === "failed"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {order.payment?.status}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {nextStatuses.length > 0 && updatingOrder !== order._id ? (
                          <Select
                            value={order.status}
                            onValueChange={(val) =>
                              handleStatusUpdate(order._id, val)
                            }
                          >
                            <SelectTrigger className="h-7 text-xs w-[140px] border-none p-0">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  STATUS_CONFIG[order.status]?.variant ||
                                  "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {STATUS_CONFIG[order.status]?.label ||
                                  order.status}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={order.status} disabled>
                                {STATUS_CONFIG[order.status]?.label} (current)
                              </SelectItem>
                              {nextStatuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                  → {STATUS_CONFIG[s]?.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : updatingOrder === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              STATUS_CONFIG[order.status]?.variant ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {STATUS_CONFIG[order.status]?.label || order.status}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Link href={`/dashboard/orders/${order._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">
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
        </Card>
      )}
    </div>
  );
}
