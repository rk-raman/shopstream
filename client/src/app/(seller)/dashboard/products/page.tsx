"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ProductList } from "@/features/seller/components/Products/ProductList/ProductList";
import { CategoryNavigation } from "@/features/seller/components/Categories/CategoryNavigation/CategoryNavigation";

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function ProductsPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const handleCreateProduct = () => {
    router.push("/dashboard/products/add");
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/dashboard/products/edit/${productId}`);
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/dashboard/products/${productId}`);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Category Navigation Sidebar */}
          <div className="lg:col-span-1">
            <CategoryNavigation
              selectedCategoryId={selectedCategoryId || undefined}
              onCategorySelect={handleCategorySelect}
              showProductCount={true}
              className="sticky top-6"
            />
          </div>

          {/* Product List */}
          <div className="lg:col-span-3">
            <ProductList
              onCreateProduct={handleCreateProduct}
              onEditProduct={handleEditProduct}
              onViewProduct={handleViewProduct}
              selectedCategoryId={selectedCategoryId}
            />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
