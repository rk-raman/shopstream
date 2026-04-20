"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/features/customer/cart/hooks/useCart";
import { useWishlist } from "@/features/customer/account/wishlist/useWishlist";
import { Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductHeader({
  name,
  price,
  originalPrice,
  rating,
  reviews,
  inStock,
  product,
}: {
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  product: any;
}) {
  const { _id } = product;
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isInWishlist(_id));
  }, [isInWishlist, _id]);

  const handleAddToCart = async () => {
    await addToCart(product, 1);
    router.push("/cart");
  };

  const handleWishlistToggle = async () => {
    setWishlisted(!wishlisted);
    await toggleWishlist(_id);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">{name}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-gray-600 ml-2">
            {rating} ({reviews} reviews)
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">
          ₹{price.toLocaleString("en-IN")}
        </span>
        {originalPrice > price && (
          <>
            <span className="text-lg text-gray-500 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <span
          className={`px-4 py-2 rounded-lg font-semibold ${
            inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition">
          Buy Now
        </button>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleWishlistToggle}
          className={`flex-1 flex items-center justify-center gap-2 border font-semibold py-2 rounded-lg transition ${
            wishlisted
              ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
              : "border-gray-300 hover:bg-gray-50 text-gray-700"
          }`}
        >
          <Heart
            size={20}
            className={wishlisted ? "fill-current" : ""}
          />
          {wishlisted ? "Wishlisted" : "Wishlist"}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition">
          <Share2 size={20} /> Share
        </button>
      </div>
    </div>
  );
}
