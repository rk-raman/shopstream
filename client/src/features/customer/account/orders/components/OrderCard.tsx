"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Order, OrderItem } from "../types";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderCardProps {
  order: Order;
}

function getItemImage(item: OrderItem): string {
  if (item.productImage) return item.productImage;
  if (typeof item.product === "object" && item.product.images?.length > 0) {
    const main = item.product.images.find((img) => img.isMain);
    return main?.url || item.product.images[0]?.url || "";
  }
  return "";
}

function getItemName(item: OrderItem): string {
  if (item.productName) return item.productName;
  if (typeof item.product === "object") return item.product.name;
  return "Product";
}

export default function OrderCard({ order }: OrderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Link
      href={`/account/orders/${order._id}`}
      className="block border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
    >
      {/* Order Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-gray-900 text-lg">
            {order.orderNumber}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <OrderStatusBadge status={order.status} />
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Order Items */}
      <div className="space-y-3 mb-4">
        {order.items.map((item, idx) => {
          const imgUrl = getItemImage(item);
          const name = getItemName(item);
          const effectivePrice = item.discountPrice || item.price;

          return (
            <div key={item._id || idx} className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    N/A
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{name}</p>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  {item.variant?.value && (
                    <span>
                      {item.variant.name}: {item.variant.value}
                    </span>
                  )}
                  <span>Qty: {item.quantity}</span>
                </div>
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

      {/* Order Total */}
      <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <p className="text-gray-600 font-medium">Order Total</p>
          <span className="text-xs text-gray-400 capitalize">
            {order.payment.method === "cod"
              ? "Cash on Delivery"
              : order.payment.method?.toUpperCase()}
          </span>
        </div>
        <p className="text-xl font-bold text-gray-900">
          ₹{order.totalAmount.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}
