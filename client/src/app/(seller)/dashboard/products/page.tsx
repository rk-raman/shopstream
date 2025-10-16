"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProductList } from "@/features/seller/components/Products/ProductList/ProductList";
import { Product } from "@/types/global";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function ProductsPage() {
  const router = useRouter();

  const handleCreate = () => router.push("/dashboard/products/add");
  const handleEdit = (product: Product) =>
    router.push(`/dashboard/products/edit/${product._id}`);
  const handleView = (product: Product) =>
    router.push(`/product/${product.slug}`);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-6">
        <ProductList
          onCreateProduct={handleCreate}
          onEditProduct={handleEdit}
          onViewProduct={handleView}
        />
      </div>
    </QueryClientProvider>
  );
}
