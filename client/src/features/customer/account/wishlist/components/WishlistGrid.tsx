"use client";

import React from "react";
import WishlistItemCard from "./WishlistItemCard";
import type { WishlistItem } from "../types";

interface WishlistGridProps {
  items: WishlistItem[];
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
}

export default function WishlistGrid({
  items,
  onRemove,
  onAddToCart,
}: WishlistGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <WishlistItemCard
          key={item.id}
          item={item}
          onRemove={onRemove}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
