"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { ProductForm } from "@/features/seller/components/Products/ProductForm/ProductForm";
import { Product } from "@/types/global";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function AddProductContent() {
  const router = useRouter();

  const handleSuccess = (product: Product) => {
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

export default function AddProductPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AddProductContent />
    </QueryClientProvider>
  );
}
