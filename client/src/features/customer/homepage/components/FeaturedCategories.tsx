import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useGetCategories } from "../hooks/useHomepage";

interface Category {
  _id: number;
  name: string;
  image: Object & { url: string };
  itemCount: string;
  bgColor: string;
  productCount: any;
}
const gradientColors = [
  "from-blue-500/20 to-purple-500/20",
  "from-pink-500/20 to-rose-500/20",
  "from-cyan-500/20 to-blue-500/20",
  "from-amber-500/20 to-orange-500/20",
  "from-purple-500/20 to-pink-500/20",
  "from-green-500/20 to-emerald-500/20",
  "from-yellow-500/20 to-orange-500/20",
  "from-indigo-500/20 to-purple-500/20",
  "from-red-500/20 to-pink-500/20",
  "from-teal-500/20 to-cyan-500/20",
];

const FeaturedCategories: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // Fetch data
  const { data: productsData, isLoading, error, refetch } = useGetCategories();
  // console.log("Featured Products Data:", productsData);

  // Normalize productsData which can be either an array of categories or an object containing data.docs
  let categories: Category[] = [];
  if (Array.isArray(productsData)) {
    categories = productsData as Category[];
  } else {
    categories = (productsData as any)?.data?.docs || [];
  }

  // Modify categories with gradient colors
  const modifyCategories: Category[] = categories.map((category, index) => ({
    ...category,
    bgColor: gradientColors[index % gradientColors.length], // Cycle through gradients
    productCount: `${category.productCount} Products`,
  }));

  return (
    <section className="bg-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600">
            Explore our wide range of products across categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {modifyCategories.map((category) => (
            <div
              key={category._id}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredCategory(category._id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square">
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.bgColor}`}
                />

                {/* Image */}
                <img
                  src={category?.image?.url}
                  alt={category.name}
                  className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 font-medium mb-2">
                      {category.productCount}
                    </p>

                    {/* Shop Now Button - Shows on hover */}
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold text-gray-900 transition-all duration-300 ${
                        hoveredCategory === category._id
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2"
                      }`}
                    >
                      <span>Shop Now</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Animated border on hover */}
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/40 rounded-2xl transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="flex justify-center mt-10">
          <button className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all hover:scale-105 transform flex items-center gap-2">
            View All Categories
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
