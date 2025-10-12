"use client";

import React from "react";

export default function WishlistInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-900">
        💡 <strong>Tip:</strong> Items in your wishlist may have limited stock.
        Add them to your cart when they're back in stock to avoid missing out!
      </p>
    </div>
  );
}
