// client/src/features/customer/account/orders/components/OrderStatusBadge.tsx

import React from "react";
import type { OrderStatus } from "../types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      delivered: {
        label: "Delivered",
        className: "bg-green-100 text-green-700",
      },
      shipped: {
        label: "Shipped",
        className: "bg-blue-100 text-blue-700",
      },
      processing: {
        label: "Processing",
        className: "bg-yellow-100 text-yellow-700",
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-100 text-red-700",
      },
    };
    return configs[status];
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
