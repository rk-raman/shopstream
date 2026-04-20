"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Ticket,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Copy,
  Eye,
  BarChart3,
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
import sellerCouponService from "@/features/seller/services/sellerCouponService";
import { toast } from "react-hot-toast";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  scheduled: "bg-blue-100 text-blue-700",
  inactive: "bg-gray-100 text-gray-500",
};

function getCouponStatus(coupon: any): string {
  const now = new Date();
  if (!coupon.isActive) return "inactive";
  if (coupon.validTo && new Date(coupon.validTo) < now) return "expired";
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return "scheduled";
  return "active";
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sellerCouponService.getAll({
        page,
        limit: 15,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      });
      if (response.success && response.data) {
        setCoupons(response.data.coupons || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await sellerCouponService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleToggle = async (id: string) => {
    try {
      const response = await sellerCouponService.toggle(id);
      if (response.success) {
        toast.success(response.message);
        fetchCoupons();
        fetchStats();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try {
      await sellerCouponService.delete(id);
      toast.success("Coupon deleted");
      fetchCoupons();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage discount codes
          </p>
        </div>
        <Link href="/dashboard/coupons/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-2xl font-bold text-gray-900">{stats.totalCoupons}</p>
            <p className="text-xs text-gray-500">Total Coupons</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.activeCoupons}</p>
            <p className="text-xs text-gray-500">Active</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-red-500">{stats.expiredCoupons}</p>
            <p className="text-xs text-gray-500">Expired</p>
          </Card>
          <Card className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.totalRedemptions}</p>
            <p className="text-xs text-gray-500">Total Redemptions</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchCoupons} variant="outline">Retry</Button>
        </Card>
      ) : coupons.length === 0 ? (
        <Card className="p-16 text-center">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No coupons yet</p>
          <p className="text-gray-400 text-sm mb-4">
            Create your first coupon to offer discounts
          </p>
          <Link href="/dashboard/coupons/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Valid Period</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-gray-700 capitalize">
                          {coupon.type}
                        </span>
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {coupon.type === "percentage"
                            ? `${coupon.value}%`
                            : `₹${coupon.value}`}
                        </span>
                        {coupon.minOrderAmount > 0 && (
                          <p className="text-xs text-gray-500">
                            Min: ₹{coupon.minOrderAmount}
                          </p>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">
                          {coupon.usedCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </span>
                      </td>

                      {/* Valid Period */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {coupon.validFrom ? formatDate(coupon.validFrom) : "Start"} — {coupon.validTo ? formatDate(coupon.validTo) : "No expiry"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/coupons/${coupon._id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleToggle(coupon._id)}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                  variant="outline" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline" size="sm"
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
