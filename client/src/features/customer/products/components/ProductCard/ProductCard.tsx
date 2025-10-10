import React from "react";
import { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  view: "grid" | "list";
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, view }) => {
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition ${
        view === "list" ? "flex gap-4 p-4" : "p-4"
      }`}
    >
      <div
        className={
          view === "list" ? "w-40 h-40 flex-shrink-0" : "aspect-square mb-3"
        }
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-sm">Product {product.id}</span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded text-xs">
            {product.rating.toFixed(1)} ★
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-gray-900">
            ${product.price}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ${product.originalPrice}
          </span>
          <span className="text-sm text-green-600 font-semibold">
            {discount}% off
          </span>
        </div>
        <div className="flex gap-2 text-xs text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">{product.brand}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
};
