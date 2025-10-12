// client/src/features/customer/account/orders/components/OrderItemsList.tsx

import React from "react";
import type { OrderItem } from "../types";

interface OrderItemsListProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderItemsList({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: OrderItemsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 object-cover rounded border border-gray-200"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">{item.name}</p>
              <div className="space-y-1">
                {item.color && (
                  <p className="text-sm text-gray-500">Color: {item.color}</p>
                )}
                {item.size && (
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                )}
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
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

      {/* Price Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span
              className={shipping === 0 ? "text-green-600 font-medium" : ""}
            >
              {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
