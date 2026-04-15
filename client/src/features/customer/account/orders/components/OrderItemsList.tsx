"use client";

import React from "react";
import Image from "next/image";
import type { OrderItem } from "../types";

interface OrderItemsListProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  total: number;
}

export default function OrderItemsList({
  items,
  subtotal,
  shipping,
  tax,
  discount = 0,
  total,
}: OrderItemsListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const imgUrl =
            item.productImage ||
            (typeof item.product === "object"
              ? item.product.images?.[0]?.url
              : "") ||
            "";
          const name =
            item.productName ||
            (typeof item.product === "object" ? item.product.name : "");
          const effectivePrice = item.discountPrice || item.price;

          return (
            <div
              key={item._id || idx}
              className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0"
            >
              <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    N/A
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">{name}</p>
                {item.variant?.value && (
                  <p className="text-sm text-gray-500">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₹{(effectivePrice * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{discount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
            {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>₹{tax.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
