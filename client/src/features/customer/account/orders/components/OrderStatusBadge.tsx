"use client";

import React from "react";
import type { OrderStatus } from "../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-gray-100 text-gray-700" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  processing: {
    label: "Processing",
    className: "bg-yellow-100 text-yellow-700",
  },
  shipped: { label: "Shipped", className: "bg-indigo-100 text-indigo-700" },
  out_for_delivery: {
    label: "Out for Delivery",
    className: "bg-purple-100 text-purple-700",
  },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  returned: { label: "Returned", className: "bg-orange-100 text-orange-700" },
  refunded: { label: "Refunded", className: "bg-pink-100 text-pink-700" },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
