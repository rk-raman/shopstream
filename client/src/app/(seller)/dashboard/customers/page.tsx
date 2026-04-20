"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  ShoppingBag,
  IndianRupee,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import sellerCustomerService from "@/features/seller/services/sellerCustomerService";

export default function SellerCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>("lastOrderDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sellerCustomerService.getCustomers({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        sortBy: sortBy as any,
        sortOrder,
      });
      if (response.success && response.data) {
        setCustomers(response.data.customers || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} customer{total !== 1 ? "s" : ""} who ordered from you
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {!isLoading && customers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total Customers</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {customers
                  .reduce((sum, c) => sum + (c.totalSpent || 0), 0)
                  .toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
          </Card>
        </div>
      )}

      {/* Search & Sort */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setSortBy(v);
              setSortOrder("desc");
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastOrderDate">Last Order</SelectItem>
              <SelectItem value="totalSpent">Total Spent</SelectItem>
              <SelectItem value="totalOrders">Order Count</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchCustomers} variant="outline">
            Retry
          </Button>
        </Card>
      ) : customers.length === 0 ? (
        <Card className="p-16 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {debouncedSearch
              ? "No customers match your search"
              : "No customers yet"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Customers will appear here once they place orders
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Customer</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSort("totalOrders")}
                  >
                    <span className="flex items-center gap-1">
                      Orders
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSort("totalSpent")}
                  >
                    <span className="flex items-center gap-1">
                      Total Spent
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3">Delivered</th>
                  <th className="px-4 py-3">Cancelled</th>
                  <th
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSort("lastOrderDate")}
                  >
                    <span className="flex items-center gap-1">
                      Last Order
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Customer Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          {customer.avatar?.url ? (
                            <img
                              src={customer.avatar.url}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {customer.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{customer.totalSpent?.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Delivered */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-green-600 font-medium">
                        {customer.deliveredCount || 0}
                      </span>
                    </td>

                    {/* Cancelled */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-red-500 font-medium">
                        {customer.cancelledCount || 0}
                      </span>
                    </td>

                    {/* Last Order */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {customer.lastOrderDate
                          ? formatDate(customer.lastOrderDate)
                          : "—"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/customers/${customer._id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
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
