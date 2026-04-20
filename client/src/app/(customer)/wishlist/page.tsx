"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useWishlist } from "@/features/customer/account/wishlist/useWishlist";
import WishlistHeader from "@/features/customer/account/wishlist/components/WishlistHeader";
import WishlistSort from "@/features/customer/account/wishlist/components/WishlistSort";
import WishlistGrid from "@/features/customer/account/wishlist/components/WishlistGrid";
import WishlistEmptyState from "@/features/customer/account/wishlist/components/WishlistEmptyState";
import WishlistInfo from "@/features/customer/account/wishlist/components/WishlistInfo";

export default function WishlistPage() {
  const {
    wishlistItems,
    sortedItems,
    sortBy,
    setSortBy,
    isLoading,
    error,
    inStockCount,
    handleRemove,
    handleAddToCart,
    handleClearAll,
    refreshWishlist,
  } = useWishlist();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refreshWishlist}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <WishlistHeader
        totalItems={wishlistItems.length}
        inStockCount={inStockCount}
      />

      {wishlistItems.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <WishlistSort sortBy={sortBy} onSortChange={setSortBy} />
            <button
              onClick={handleClearAll}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <WishlistGrid
            items={sortedItems}
            onRemove={handleRemove}
            onAddToCart={handleAddToCart}
          />

          <WishlistInfo />
        </>
      ) : (
        <WishlistEmptyState />
      )}
    </div>
  );
}
