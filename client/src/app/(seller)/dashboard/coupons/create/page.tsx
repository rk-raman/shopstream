"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Copy } from "lucide-react";
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

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CreateCouponPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "percentage" as "percentage" | "flat",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    validFrom: "",
    validTo: "",
    usageLimit: "",
    perUserLimit: "1",
    isActive: true,
  });

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = () => {
    updateForm("code", generateCode());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }
    if (form.type === "percentage" && Number(form.value) > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: any = {
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        value: Number(form.value),
        isActive: form.isActive,
      };

      if (form.validFrom) data.validFrom = form.validFrom;
      if (form.validTo) data.validTo = form.validTo;

      if (form.minOrderAmount) data.minOrderAmount = Number(form.minOrderAmount);
      if (form.maxDiscount) data.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit) data.usageLimit = Number(form.usageLimit);
      if (form.perUserLimit) data.perUserLimit = Number(form.perUserLimit);

      await sellerCouponService.create(data);
      toast.success("Coupon created successfully!");
      router.push("/dashboard/coupons");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Back */}
      <Link
        href="/dashboard/coupons"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Coupons
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Coupon</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Coupon Code */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Discount Code
          </h2>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={form.code}
                  onChange={(e) =>
                    updateForm("code", e.target.value.toUpperCase())
                  }
                  placeholder="e.g., SUMMER25"
                  className="font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateCode}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Customers will enter this code at checkout
              </p>
            </div>

            <div>
              <Label>Description (internal note)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="e.g., Summer sale campaign - 25% off all orders"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Discount Value */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Discount Value
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v: any) => updateForm("type", v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {form.type === "percentage"
                    ? "Percentage Off"
                    : "Discount Amount"}
                </Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    value={form.value}
                    onChange={(e) => updateForm("value", e.target.value)}
                    placeholder={form.type === "percentage" ? "25" : "500"}
                    min="0"
                    max={form.type === "percentage" ? "100" : undefined}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {form.type === "percentage" ? "%" : "₹"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Order Amount</Label>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      updateForm("minOrderAmount", e.target.value)
                    }
                    placeholder="No minimum"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ₹
                  </span>
                </div>
              </div>
              {form.type === "percentage" && (
                <div>
                  <Label>Maximum Discount Cap</Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={form.maxDiscount}
                      onChange={(e) =>
                        updateForm("maxDiscount", e.target.value)
                      }
                      placeholder="No cap"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ₹
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Caps the max discount for percentage-type coupons
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Active Dates (optional) */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Active Dates
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Leave empty for no date restriction
          </p>
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
                min={form.validFrom || undefined}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Usage Limits */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Usage Limits
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Usage Limit</Label>
              <Input
                type="number"
                value={form.usageLimit}
                onChange={(e) => updateForm("usageLimit", e.target.value)}
                placeholder="Unlimited"
                min="0"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for unlimited
              </p>
            </div>
            <div>
              <Label>Uses Per Customer</Label>
              <Input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => updateForm("perUserLimit", e.target.value)}
                placeholder="1"
                min="1"
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Status</h2>
              <p className="text-sm text-gray-500">
                {form.isActive
                  ? "Coupon will be active immediately"
                  : "Coupon will be saved as a draft"}
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => updateForm("isActive", v)}
            />
          </div>
        </Card>

        {/* Preview */}
        {form.code && form.value && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h2 className="text-sm font-semibold text-blue-900 mb-2">
              Preview
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-2xl font-bold text-blue-700">
                  {form.code}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {form.type === "percentage"
                    ? `${form.value}% off`
                    : `₹${Number(form.value).toLocaleString("en-IN")} off`}
                  {form.minOrderAmount
                    ? ` on orders above ₹${Number(form.minOrderAmount).toLocaleString("en-IN")}`
                    : ""}
                  {form.type === "percentage" && form.maxDiscount
                    ? ` (max ₹${Number(form.maxDiscount).toLocaleString("en-IN")})`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(form.code);
                  toast.success("Code copied!");
                }}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Copy className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Create Coupon
          </Button>
          <Link href="/dashboard/coupons">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
