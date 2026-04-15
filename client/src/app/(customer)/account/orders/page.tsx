"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import OrderCard from "@/features/customer/account/orders/components/OrderCard";
import OrderSearchFilter from "@/features/customer/account/orders/components/OrderSearchFilter";
import OrderEmptyState from "@/features/customer/account/orders/components/OrderEmptyState";
import orderService from "@/features/customer/account/orders/services/orderService";
import type { Order } from "@/features/customer/account/orders/types";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getMyOrders({
        page,
        limit: 10,
        status: selectedFilter !== "all" ? selectedFilter : undefined,
      });
      if (response.success && response.data) {
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedFilter]);

  // Client-side search filtering (search within loaded results)
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(term) ||
      order.items.some((item) =>
        (item.productName || "").toLowerCase().includes(term)
      )
    );
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h2>

        <OrderSearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </div>

      {/* Orders List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <OrderEmptyState
            message={
              searchTerm
                ? "No orders match your search"
                : selectedFilter !== "all"
                ? `No ${selectedFilter} orders`
                : "You haven't placed any orders yet"
            }
            showButton={!searchTerm && selectedFilter === "all"}
          />
        ) : (
          <>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
