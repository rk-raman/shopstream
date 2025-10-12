"use client";

import React from "react";
import type { SortBy } from "../useWishlist";

interface WishlistSortProps {
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export default function WishlistSort({
  sortBy,
  onSortChange,
}: WishlistSortProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <label className="text-sm font-medium text-gray-700 mr-4">Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortBy)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      >
        <option value="newest">Newest First</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
    </div>
  );
}
