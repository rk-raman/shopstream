"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart } from "lucide-react";
import { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  view: "grid" | "list";
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  view,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const price = product.price || product.effectivePrice || product.discountPrice || product.basePrice;
  const originalPrice = product.originalPrice || product.basePrice;
  const hasDiscount = originalPrice > price;
  const discount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const image = product.image || product.images?.[0]?.url || "";
  const ratingValue = typeof product.rating === "object" ? product.rating.average : (product.rating || 0);
  const reviewCount = typeof product.rating === "object" ? product.rating.count : (product.reviews || 0);
  const categoryName = product.category && typeof product.category === "object" ? product.category.name : product.category;
  const brandName = product.brand && typeof product.brand === "object" ? product.brand.name : product.brand;
  const inStock = product.inStock ?? ((product.stock ?? 0) > 0);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist?.(product._id);
  };

  return (
    <Link
      href={`/product/${product._id}`}
      className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group ${
        view === "list" ? "flex gap-4" : "flex flex-col"
      }`}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-gray-100 ${
          view === "list" ? "w-48 h-48 flex-shrink-0" : "aspect-square"
        }`}
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            {discount}% OFF
          </span>
        )}

        {/* Out of Stock */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md transition-transform hover:scale-110 ${
            isWishlisted ? "bg-red-50" : "bg-white"
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </button>
      </div>

      {/* Info */}
      <div className={`flex-1 ${view === "list" ? "py-3 pr-4" : "p-3"}`}>
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {ratingValue > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="flex items-center gap-0.5 bg-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
              {ratingValue.toFixed(1)}
              <Star className="w-3 h-3 fill-white" />
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">
                ({reviewCount.toLocaleString("en-IN")})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            ₹{price.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-green-600 font-semibold">
                {discount}% off
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {brandName && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {brandName}
            </span>
          )}
          {categoryName && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {categoryName}
            </span>
          )}
        </div>

        {view === "list" && product.shortDescription && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {product.shortDescription}
          </p>
        )}
      </div>
    </Link>
  );
};
