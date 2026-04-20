"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart, Star, AlertCircle } from "lucide-react";
import type { WishlistItem } from "../types";

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onAddToCart: (item: WishlistItem) => void;
}

export default function WishlistItemCard({
  item,
  onRemove,
  onAddToCart,
}: WishlistItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden group">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            No image
          </div>
        )}

        {/* Stock Badge */}
        {!item.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {item.discount && (
          <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
            -{item.discount}%
          </div>
        )}

        {/* Heart Icon */}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          aria-label="Remove from wishlist"
        >
          <Heart className="w-5 h-5 text-red-600 fill-current" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Name */}
        <Link
          href={`/shop/products/${item.productId}`}
          className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2"
        >
          {item.name}
        </Link>

        {/* Rating */}
        {item.rating !== undefined && (
          <div className="flex items-center space-x-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(item.rating || 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
            {item.reviewCount !== undefined && (
              <span className="text-xs text-gray-600 ml-1">
                ({item.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{item.price.toLocaleString("en-IN")}
            </span>
            {item.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{item.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          {item.inStock ? (
            <p className="text-sm text-green-600 font-medium">In Stock</p>
          ) : (
            <p className="text-sm text-gray-500 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>Out of Stock</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-auto">
          <button
            onClick={() => onAddToCart(item)}
            disabled={!item.inStock}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              item.inStock
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Delete from wishlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
