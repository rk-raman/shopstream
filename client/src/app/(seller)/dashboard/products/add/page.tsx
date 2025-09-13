"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ProductForm } from "@/features/seller/components/Products/ProductForm/ProductForm";
import { Product } from "@/types/global";

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AddProductContent() {
  const router = useRouter();

  const handleSuccess = (product: Product) => {
    // Redirect to products list or product detail page
    router.push("/dashboard/products");
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <AddProductContent />
    </QueryClientProvider>
  );
}
