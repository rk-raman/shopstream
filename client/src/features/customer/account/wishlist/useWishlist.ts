"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import wishlistService from "./services/wishlistService";
import { toWishlistItem } from "./types";
import type { WishlistItem } from "./types";

export type SortBy = "newest" | "price-low" | "price-high";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistService.getWishlist();
      if (response.success && response.data?.wishlist) {
        const items = response.data.wishlist
          .filter((p: any) => p != null)
          .map(toWishlistItem);
        setWishlistItems(items);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const sortedItems = useMemo(() => {
    const sorted = [...wishlistItems];
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

  const handleRemove = useCallback(
    async (id: string) => {
      try {
        await wishlistService.removeFromWishlist(id);
        setWishlistItems((prev) => prev.filter((item) => item.id !== id));
        window.dispatchEvent(new Event("wishlist-updated"));
        toast.success("Removed from wishlist");
      } catch (err: any) {
        toast.error(err.message || "Failed to remove");
      }
    },
    []
  );

  const handleAddToCart = useCallback((item: WishlistItem) => {
    // Will be integrated with cart service
    toast.success(`${item.name} added to cart`);
  }, []);

  const handleClearAll = useCallback(async () => {
    try {
      await wishlistService.clearWishlist();
      setWishlistItems([]);
      window.dispatchEvent(new Event("wishlist-updated"));
      toast.success("Wishlist cleared");
    } catch (err: any) {
      toast.error(err.message || "Failed to clear wishlist");
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistItems.some((item) => item.productId === productId);
    },
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const exists = wishlistItems.some((item) => item.productId === productId);
      if (exists) {
        await handleRemove(productId);
      } else {
        try {
          await wishlistService.addToWishlist(productId);
          toast.success("Added to wishlist");
          await fetchWishlist();
          window.dispatchEvent(new Event("wishlist-updated"));
        } catch (err: any) {
          if (err.message?.includes("already")) {
            toast.error("Already in wishlist");
          } else {
            toast.error(err.message || "Failed to add");
          }
        }
      }
    },
    [wishlistItems, handleRemove, fetchWishlist]
  );

  return {
    wishlistItems,
    sortedItems,
    sortBy,
    setSortBy,
    isLoading,
    error,
    inStockCount,
    count: wishlistItems.length,
    handleRemove,
    handleAddToCart,
    handleClearAll,
    isInWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlist,
  };
}
