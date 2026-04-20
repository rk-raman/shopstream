"use client";

import React, { useState } from "react";
import {
  Heart,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFeatureProducts } from "../hooks/useHomepage";
import { useWishlist } from "@/features/customer/account/wishlist/useWishlist";
import Link from "next/link";

interface Product {
  _id: string;
  images: { url: string }[];
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  effectivePrice?: number;
  basePrice: number;
  discountPrice?: number;
  discountPercentage?: number;
}

const FeaturedProducts: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Fetch data
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useFeatureProducts();
  const products: Product[] = productsData?.data?.products || [];

  const handleWishlistToggle = async (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  const productsPerPage = 4;
  const totalPages = Math.ceil(products.length / productsPerPage);

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleProducts = products.slice(
    currentSlide * productsPerPage,
    (currentSlide + 1) * productsPerPage
  );

  return (
    <section className="bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600">Handpicked deals just for you</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50"
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50"
              disabled={currentSlide === totalPages - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Grid - Always 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleProducts.map((product) => {
            const wishlisted = isInWishlist(product._id);

            return (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={product.images[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      {product.badge}
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleWishlistToggle(e, product._id)}
                    className={`absolute top-2 right-2 p-2 rounded-full shadow-md hover:scale-110 transition-transform ${
                      wishlisted ? "bg-red-50" : "bg-white"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Discount Badge */}
                  {product?.discountPercentage && (
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {product.discountPercentage}% OFF
                    </div>
                  )}

                  {/* Quick Add to Cart - Shows on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-full py-2 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black/20 transition-colors">
                      <ShoppingCart className="w-4 h-4" />
                      Quick Add
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    {/* {product.brand} */}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 h-10">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs text-gray-500"></span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product?.effectivePrice?.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ₹{product?.basePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Slider indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-8">
          <Link href="/shop/products" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all hover:scale-105 transform">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
