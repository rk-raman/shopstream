"use client";

import React from "react";
import { Tag } from "lucide-react";

interface WishlistHeaderProps {
  totalItems: number;
  inStockCount: number;
}

export default function WishlistHeader({
  totalItems,
  inStockCount,
}: WishlistHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-1">
          {totalItems} item{totalItems !== 1 ? "s" : ""} saved
        </p>
      </div>

      {totalItems > 0 && (
        <div className="flex items-center space-x-4 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
          <Tag className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              {inStockCount} item{inStockCount !== 1 ? "s" : ""} in stock
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
