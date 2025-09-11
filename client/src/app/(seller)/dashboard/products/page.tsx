"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Product } from "@/types/global";
import { ProductList } from "@/features/seller/components/Products/ProductList/ProductList";
import { ProductForm } from "@/features/seller/components/Products/ProductForm/ProductForm";

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

type ViewMode = "list" | "create" | "edit" | "view";

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const handleCreateProduct = () => {
    setSelectedProduct(undefined);
    setViewMode("create");
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewMode("edit");
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewMode("view");
  };

  const handleFormSuccess = (product: Product) => {
    setViewMode("list");
    setSelectedProduct(undefined);
  };

  const handleFormCancel = () => {
    setViewMode("list");
    setSelectedProduct(undefined);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return (
          <ProductForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        );
      case "edit":
        return (
          <ProductForm
            product={selectedProduct}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        );
      case "view":
        return (
          <ProductView
            product={selectedProduct!}
            onEdit={() => handleEditProduct(selectedProduct!)}
            onBack={handleFormCancel}
          />
        );
      case "list":
      default:
        return (
          <ProductList
            onCreateProduct={handleCreateProduct}
            onEditProduct={handleEditProduct}
            onViewProduct={handleViewProduct}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-6">{renderContent()}</div>
    </QueryClientProvider>
  );
}

// Product View Component for displaying product details
interface ProductViewProps {
  product: Product;
  onEdit: () => void;
  onBack: () => void;
}

const ProductView: React.FC<ProductViewProps> = ({
  product,
  onEdit,
  onBack,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-gray-600">Product Details</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit Product
        </button>
      </div>

      {/* Product Images */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${product.name} ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border"
            />
          ))}
        </div>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{product.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Category
              </label>
              <p className="text-gray-900">{product.category}</p>
            </div>
            {product.subcategory && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Subcategory
                </label>
                <p className="text-gray-900">{product.subcategory}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  product.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Pricing & Stock</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Price</label>
              <p className="text-gray-900 text-xl font-bold">
                {formatPrice(product.price)}
              </p>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Original Price
                </label>
                <p className="text-gray-900 line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Stock</label>
              <p className="text-gray-900">{product.stock} units</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Rating
              </label>
              <p className="text-gray-900">
                ★ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {product.description}
        </p>
      </div>

      {/* Seller Information */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Seller Information</h2>
        <div className="flex items-center gap-3">
          {product.seller.avatar && (
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{product.seller.name}</p>
            <p className="text-sm text-gray-500">
              Seller ID: {product.seller.id}
            </p>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Timestamps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-gray-900">
              {new Date(product.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Last Updated
            </label>
            <p className="text-gray-900">
              {new Date(product.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
