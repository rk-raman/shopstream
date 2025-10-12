// client/src/features/customer/account/orders/components/OrderCard.tsx

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Order } from "../types";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
    >
      {/* Order Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-gray-900 text-lg">
            {order.orderNumber}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(order.date)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <OrderStatusBadge status={order.status} />
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-3 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.name}</p>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {item.color && <span>Color: {item.color}</span>}
                {item.size && <span>Size: {item.size}</span>}
                <span>Qty: {item.quantity}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ₹{item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Total */}
      <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
        <p className="text-gray-600 font-medium">Order Total</p>
        <p className="text-xl font-bold text-gray-900">
          ₹{order.total.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
