// client/src/features/customer/homepage/components/TrendingCollections/TrendingCollections.tsx
"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

const collections: Collection[] = [
  {
    id: "1",
    name: "Weekend Essentials",
    slug: "weekend-essentials",
    description: "Everything you need for a perfect weekend getaway",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    productCount: 45,
  },
  {
    id: "2",
    name: "Work From Home",
    slug: "work-from-home",
    description: "Create your perfect home office setup",
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600",
    productCount: 67,
  },
  {
    id: "3",
    name: "Fitness & Wellness",
    slug: "fitness-wellness",
    description: "Stay healthy and active with our curated selection",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600",
    productCount: 89,
  },
];

export default function TrendingCollections() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Trending Now
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Popular Collections
            </h2>
            <p className="text-gray-600">
              Curated collections for every lifestyle
            </p>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${collection.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-900">
                  {collection.productCount} Items
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {collection.name}
                </h3>
                <p className="text-gray-600 mb-4">{collection.description}</p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  Explore Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
