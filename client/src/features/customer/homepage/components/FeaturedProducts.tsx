import React, { useState } from "react";
import {
  Heart,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useFeatureProducts } from "../hooks/useHomepage";
import Link from "next/link";

interface Product {
  _id: number;
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
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Fetch data
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useFeatureProducts();
  // console.log("Featured Products Data:", productsData);
  const products: Product[] = productsData?.data?.products || [];

  // const products: Product[] = [
  //   {
  //     id: 1,
  //     name: "Slim Fit Casual Shirt",
  //     brand: "ZARA",
  //     price: 1299,
  //     originalPrice: 2599,
  //     discount: 50,
  //     rating: 4.3,
  //     reviews: 2840,
  //     image:
  //       "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
  //     badge: "Bestseller",
  //   },
  //   {
  //     id: 2,
  //     name: "Women's Kurta Set",
  //     brand: "Libas",
  //     price: 1899,
  //     originalPrice: 3999,
  //     discount: 52,
  //     rating: 4.5,
  //     reviews: 1560,
  //     image:
  //       "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop",
  //     badge: "Trending",
  //   },
  //   {
  //     id: 3,
  //     name: "Wireless Headphones",
  //     brand: "boAt",
  //     price: 1999,
  //     originalPrice: 4990,
  //     discount: 60,
  //     rating: 4.2,
  //     reviews: 8420,
  //     image:
  //       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
  //     badge: "Hot Deal",
  //   },
  //   {
  //     id: 4,
  //     name: "Running Shoes",
  //     brand: "Nike",
  //     price: 3499,
  //     originalPrice: 6999,
  //     discount: 50,
  //     rating: 4.6,
  //     reviews: 3240,
  //     image:
  //       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
  //   },
  //   {
  //     id: 5,
  //     name: "Denim Jacket",
  //     brand: "Levi's",
  //     price: 2799,
  //     originalPrice: 5599,
  //     discount: 50,
  //     rating: 4.4,
  //     reviews: 1890,
  //     image:
  //       "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
  //     badge: "New Arrival",
  //   },
  //   {
  //     id: 6,
  //     name: "Smartwatch Pro",
  //     brand: "Noise",
  //     price: 2499,
  //     originalPrice: 7999,
  //     discount: 69,
  //     rating: 4.1,
  //     reviews: 5620,
  //     image:
  //       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop",
  //     badge: "Limited",
  //   },
  // ];

  const toggleWishlist = (id: number): void => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
          {visibleProducts.map((product) => (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product._id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      wishlist.includes(product._id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>

                {/* Discount Badge */}
                <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {product?.discountPercentage}% OFF
                </div>

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
                  {/* <div className="flex items-center bg-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    {product.rating}
                    <Star className="w-3 h-3 ml-0.5 fill-white" />
                  </div> */}
                  <span className="text-xs text-gray-500">
                    {/* ({product.reviews.toLocaleString()}) */}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-gray-900">
                    ${product?.effectivePrice?.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    ${product?.basePrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all hover:scale-105 transform">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
