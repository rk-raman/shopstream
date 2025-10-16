"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ProductForm } from "@/features/seller/components/Products/ProductForm/ProductForm";
import { useProduct } from "@/features/seller/hooks/useProducts";
import { Product } from "@/types/global";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function EditProductContent() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useProduct(productId);

  const handleSuccess = (product: Product) => {
    // Redirect to products list or product detail page
    router.push("/dashboard/products");
  };

  const handleCancel = () => {
    router.push("/dashboard/products");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading product...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Failed to load product
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || "Something went wrong while loading the product."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => refetch()}>Try Again</Button>
            <Button variant="outline" onClick={handleCancel}>
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!productData?.data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Product not found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={handleCancel}>Go Back to Products</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductForm
        product={productData?.data?.product}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function EditProductPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditProductContent />
    </QueryClientProvider>
  );
}
