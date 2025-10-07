import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  image: string;
  itemCount: string;
  bgColor: string;
}

const FeaturedCategories: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const categories: Category[] = [
    {
      id: 1,
      name: "Men's Fashion",
      image:
        "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&h=400&fit=crop",
      itemCount: "2,500+ Products",
      bgColor: "from-blue-500/20 to-purple-500/20",
    },
    {
      id: 2,
      name: "Women's Fashion",
      image:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
      itemCount: "3,200+ Products",
      bgColor: "from-pink-500/20 to-rose-500/20",
    },
    {
      id: 3,
      name: "Electronics",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop",
      itemCount: "1,800+ Products",
      bgColor: "from-cyan-500/20 to-blue-500/20",
    },
    {
      id: 4,
      name: "Home & Living",
      image:
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
      itemCount: "1,500+ Products",
      bgColor: "from-amber-500/20 to-orange-500/20",
    },
    {
      id: 5,
      name: "Beauty & Personal Care",
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
      itemCount: "2,100+ Products",
      bgColor: "from-purple-500/20 to-pink-500/20",
    },
    {
      id: 6,
      name: "Sports & Fitness",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
      itemCount: "1,200+ Products",
      bgColor: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: 7,
      name: "Kids & Toys",
      image:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop",
      itemCount: "1,900+ Products",
      bgColor: "from-yellow-500/20 to-orange-500/20",
    },
    {
      id: 8,
      name: "Books & Stationery",
      image:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop",
      itemCount: "800+ Products",
      bgColor: "from-indigo-500/20 to-purple-500/20",
    },
  ];

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
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="relative overflow-hidden rounded-2xl aspect-square">
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.bgColor}`}
                />

                {/* Image */}
                <img
                  src={category.image}
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
                      {category.itemCount}
                    </p>

                    {/* Shop Now Button - Shows on hover */}
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold text-gray-900 transition-all duration-300 ${
                        hoveredCategory === category.id
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
