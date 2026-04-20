"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Copy,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import sellerCouponService from "@/features/seller/services/sellerCouponService";
import { toast } from "react-hot-toast";

export default function CouponDetailPage() {
  const params = useParams();
  const router = useRouter();
  const couponId = params.id as string;

  const [coupon, setCoupon] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<any>({});

  const fetchCoupon = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [couponRes, usageRes] = await Promise.all([
        sellerCouponService.getById(couponId),
        sellerCouponService.getUsage(couponId),
      ]);

      if (couponRes.success && couponRes.data?.coupon) {
        const c = couponRes.data.coupon;
        setCoupon(c);
        setForm({
          description: c.description || "",
          type: c.type,
          value: c.value,
          minOrderAmount: c.minOrderAmount || "",
          maxDiscount: c.maxDiscount || "",
          validFrom: c.validFrom?.split("T")[0] || "",
          validTo: c.validTo?.split("T")[0] || "",
          usageLimit: c.usageLimit || "",
          perUserLimit: c.perUserLimit || 1,
          isActive: c.isActive,
        });
      }

      if (usageRes.success && usageRes.data?.usage) {
        setUsage(usageRes.data.usage);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [couponId]);

  useEffect(() => {
    fetchCoupon();
  }, [fetchCoupon]);

  const updateForm = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data: any = {
        description: form.description || undefined,
        type: form.type,
        value: Number(form.value),
        isActive: form.isActive,
        perUserLimit: Number(form.perUserLimit) || 1,
      };
      if (form.validFrom) data.validFrom = form.validFrom;
      else data.validFrom = null;
      if (form.validTo) data.validTo = form.validTo;
      else data.validTo = null;
      if (form.minOrderAmount) data.minOrderAmount = Number(form.minOrderAmount);
      if (form.maxDiscount) data.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit) data.usageLimit = Number(form.usageLimit);

      await sellerCouponService.update(couponId, data);
      toast.success("Coupon updated");
      setIsEditing(false);
      fetchCoupon();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    try {
      await sellerCouponService.delete(couponId);
      toast.success("Coupon deleted");
      router.push("/dashboard/coupons");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggle = async () => {
    try {
      const res = await sellerCouponService.toggle(couponId);
      if (res.success) {
        toast.success(res.message);
        fetchCoupon();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{error || "Coupon not found"}</p>
          <Link href="/dashboard/coupons">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Coupons
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const isExpired = coupon.validTo ? new Date(coupon.validTo) < now : false;
  const isScheduled = coupon.validFrom ? new Date(coupon.validFrom) > now : false;
  const statusLabel = !coupon.isActive
    ? "Inactive"
    : isExpired
    ? "Expired"
    : isScheduled
    ? "Scheduled"
    : "Active";
  const usagePercent = coupon.usageLimit
    ? Math.round((coupon.usedCount / coupon.usageLimit) * 100)
    : null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/dashboard/coupons"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Coupons
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-3xl font-bold text-gray-900">
              {coupon.code}
            </h1>
            <button
              onClick={() => {
                navigator.clipboard.writeText(coupon.code);
                toast.success("Copied!");
              }}
              className="p-1.5 rounded hover:bg-gray-100"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {coupon.description && (
            <p className="text-gray-500 mt-1">{coupon.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          <button
            onClick={handleToggle}
            className="p-2 rounded hover:bg-gray-100"
            title={coupon.isActive ? "Deactivate" : "Activate"}
          >
            {coupon.isActive ? (
              <ToggleRight className="w-6 h-6 text-green-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-gray-400" />
            )}
          </button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {coupon.type === "percentage"
              ? `${coupon.value}%`
              : `₹${coupon.value}`}
          </p>
          <p className="text-xs text-gray-500">Discount</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {coupon.usedCount}
            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
          </p>
          <p className="text-xs text-gray-500">Times Used</p>
        </Card>
        <Card className="p-4 text-center">
          <p className={`text-lg font-bold capitalize ${
            statusLabel === "Active" ? "text-green-600"
            : statusLabel === "Expired" ? "text-red-500"
            : statusLabel === "Scheduled" ? "text-blue-600"
            : "text-gray-500"
          }`}>
            {statusLabel}
          </p>
          <p className="text-xs text-gray-500">Status</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-sm font-bold text-gray-900">
            {coupon.validTo ? formatDate(coupon.validTo) : "No expiry"}
          </p>
          <p className="text-xs text-gray-500">
            {coupon.validTo ? (isExpired ? "Expired on" : "Expires on") : "Never expires"}
          </p>
        </Card>
      </div>

      {/* Usage Progress */}
      {usagePercent !== null && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Usage: {coupon.usedCount} / {coupon.usageLimit}
            </span>
            <span className="text-sm text-gray-500">{usagePercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Details / Edit */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {isEditing ? "Edit Coupon" : "Coupon Details"}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Discount Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(v) => updateForm("type", v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={form.value}
                      onChange={(e) => updateForm("value", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Order Amount</Label>
                    <Input
                      type="number"
                      value={form.minOrderAmount}
                      onChange={(e) => updateForm("minOrderAmount", e.target.value)}
                      placeholder="No minimum"
                      className="mt-1"
                    />
                  </div>
                  {form.type === "percentage" && (
                    <div>
                      <Label>Max Discount Cap</Label>
                      <Input
                        type="number"
                        value={form.maxDiscount}
                        onChange={(e) => updateForm("maxDiscount", e.target.value)}
                        placeholder="No cap"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date (optional)</Label>
                    <Input
                      type="date"
                      value={form.validFrom}
                      onChange={(e) => updateForm("validFrom", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>End Date (optional)</Label>
                    <Input
                      type="date"
                      value={form.validTo}
                      onChange={(e) => updateForm("validTo", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Usage Limit</Label>
                    <Input
                      type="number"
                      value={form.usageLimit}
                      onChange={(e) => updateForm("usageLimit", e.target.value)}
                      placeholder="Unlimited"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Per Customer</Label>
                    <Input
                      type="number"
                      value={form.perUserLimit}
                      onChange={(e) => updateForm("perUserLimit", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label>Active</Label>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => updateForm("isActive", v)}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    <Save className="w-4 h-4 mr-1" />
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{coupon.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Value</span>
                  <span className="font-medium">
                    {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                  </span>
                </div>
                {coupon.minOrderAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min Order</span>
                    <span className="font-medium">₹{coupon.minOrderAmount}</span>
                  </div>
                )}
                {coupon.maxDiscount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Discount</span>
                    <span className="font-medium">₹{coupon.maxDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Valid From</span>
                  <span className="font-medium">{coupon.validFrom ? formatDate(coupon.validFrom) : "Immediately"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valid To</span>
                  <span className="font-medium">{coupon.validTo ? formatDate(coupon.validTo) : "No expiry"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Per Customer</span>
                  <span className="font-medium">{coupon.perUserLimit} use(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium">{formatDate(coupon.createdAt)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right — Usage History */}
        <div>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Recent Redemptions ({coupon.usedCount})
            </h3>

            {usage.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No redemptions yet
              </p>
            ) : (
              <div className="space-y-3">
                {usage.map((entry: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {entry.user?.firstName} {entry.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.user?.email}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(entry.usedAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
