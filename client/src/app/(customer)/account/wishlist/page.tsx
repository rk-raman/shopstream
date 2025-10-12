// client/src/app/(customer)/account/wishlist/page.tsx
"use client";

import React from "react";
import type { WishlistItem } from "@/features/customer/account/wishlist/types";
import { useWishlist } from "@/features/customer/account/wishlist/useWishlist";
import WishlistHeader from "@/features/customer/account/wishlist/components/WishlistHeader";
import WishlistSort from "@/features/customer/account/wishlist/components/WishlistSort";
import WishlistGrid from "@/features/customer/account/wishlist/components/WishlistGrid";
import WishlistEmptyState from "@/features/customer/account/wishlist/components/WishlistEmptyState";
import WishlistInfo from "@/features/customer/account/wishlist/components/WishlistInfo";

// Mock data - Replace with API call
const mockWishlistItems: WishlistItem[] = [
  {
    id: "1",
    productId: "p1",
    name: "Premium Wireless Headphones",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
    price: 2499,
    originalPrice: 4999,
    discount: 50,
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
  },
  {
    id: "2",
    productId: "p2",
    name: "Smart Fitness Band",
    image:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&h=800&fit=crop",
    price: 1299,
    originalPrice: 2499,
    discount: 48,
    inStock: true,
    rating: 4,
    reviewCount: 95,
  },
  {
    id: "3",
    productId: "p3",
    name: "Laptop Backpack with USB Port",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
    price: 1999,
    originalPrice: 3999,
    discount: 50,
    inStock: false,
    rating: 4.2,
    reviewCount: 156,
  },
  {
    id: "4",
    productId: "p4",
    name: "Portable USB-C Hub",
    image:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&h=800&fit=crop",
    price: 799,
    originalPrice: 1499,
    discount: 47,
    inStock: true,
    rating: 3.8,
    reviewCount: 72,
  },
];

export default function WishlistPage() {
  const {
    wishlistItems,
    sortedItems,
    sortBy,
    setSortBy,
    inStockCount,
    handleRemove,
    handleAddToCart,
  } = useWishlist(mockWishlistItems);

  return (
    <div className="space-y-6">
      <WishlistHeader
        totalItems={wishlistItems.length}
        inStockCount={inStockCount}
      />

      {wishlistItems.length > 0 ? (
        <>
          <WishlistSort sortBy={sortBy} onSortChange={setSortBy} />

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
