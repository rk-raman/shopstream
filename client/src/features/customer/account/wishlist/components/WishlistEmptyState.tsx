"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistEmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
      <p className="text-gray-400 mb-6">
        Start adding items to your wishlist to save them for later
      </p>
      <Link
        href="/products"
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
