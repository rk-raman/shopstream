import { useState, useMemo } from "react";
import type { WishlistItem } from "../types";

export type SortBy = "newest" | "price-low" | "price-high";

export function useWishlist(initialItems: WishlistItem[]) {
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>(initialItems);
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const sortedItems = useMemo(() => {
    let sorted = [...wishlistItems];
    if (sortBy === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    }
    return sorted;
  }, [wishlistItems, sortBy]);

  const inStockCount = useMemo(
    () => wishlistItems.filter((item) => item.inStock).length,
    [wishlistItems]
  );

  const handleRemove = (id: string) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id));
  };

  const handleAddToCart = (item: WishlistItem) => {
    // TODO: Implement cart logic
    console.log("Added to cart:", item.name);
  };

  const handleClearAll = () => {
    setWishlistItems([]);
  };

  return {
    wishlistItems,
    sortedItems,
    sortBy,
    setSortBy,
    inStockCount,
    handleRemove,
    handleAddToCart,
    handleClearAll,
  };
}
