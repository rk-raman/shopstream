"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ProductList } from "@/features/seller/components/Products/ProductList/ProductList";

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

  const handleCreateProduct = () => {
    router.push("/dashboard/products/add");
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/dashboard/products/edit/${productId}`);
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/dashboard/products/${productId}`);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-6">
        <ProductList
          onCreateProduct={handleCreateProduct}
          onEditProduct={handleEditProduct}
          onViewProduct={handleViewProduct}
        />
      </div>
    </QueryClientProvider>
  );
}
