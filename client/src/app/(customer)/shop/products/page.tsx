import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products - ShopStream",
  description: "Browse our wide selection of products",
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Products will be displayed here</p>
        <p className="text-gray-400 mt-2">
          Product listing functionality coming soon
        </p>
      </div>
    </div>
  );
}
