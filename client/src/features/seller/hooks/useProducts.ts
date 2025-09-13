"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMyProducts,
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProducts,
  updateProductStatus,
  uploadProductImages,
  getCategories,
  getBrands,
  getProductStats,
  searchProducts,
  getProductReviews,
  addProductReview,
  ProductFilters,
  ProductFormData,
} from "../services/productService";
import { Product } from "@/types/global";

// Query Keys
export const PRODUCT_QUERY_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, "list"] as const,
  list: (filters: ProductFilters) =>
    [...PRODUCT_QUERY_KEYS.lists(), filters] as const,
  myProducts: (filters: ProductFilters) =>
    [...PRODUCT_QUERY_KEYS.all, "my", filters] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PRODUCT_QUERY_KEYS.details(), id] as const,
  search: (query: string, options: ProductFilters) =>
    [...PRODUCT_QUERY_KEYS.all, "search", query, options] as const,
  stats: () => [...PRODUCT_QUERY_KEYS.all, "stats"] as const,
  categories: ["categories"] as const,
  brands: ["brands"] as const,
};

// Get seller's products
export const useMyProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.myProducts(filters),
    queryFn: () => getMyProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get all products (public)
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// Get single product
export const useProduct = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: () => getProduct(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get product by slug
export const useProductBySlug = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEYS.details(), "slug", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Search products
export const useSearchProducts = (
  query: string,
  options: ProductFilters = {}
) => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.search(query, options),
    queryFn: () => searchProducts(query, options),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Get product statistics
export const useProductStats = () => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.stats(),
    queryFn: () => getProductStats(),
    staleTime: 2 * 60 * 1000,
  });
};

// Get categories
export const useCategories = () => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.categories,
    queryFn: () => getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get brands
export const useBrands = () => {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.brands,
    queryFn: () => getBrands(),
    staleTime: 30 * 60 * 1000,
  });
};

// Get product reviews
export const useProductReviews = (
  productId: string,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: [
      ...PRODUCT_QUERY_KEYS.details(),
      "reviews",
      productId,
      page,
      limit,
    ],
    queryFn: () => getProductReviews(productId, page, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hooks
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductFormData) => createProduct(productData),
    onSuccess: (response) => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      productData,
    }: {
      id: string;
      productData: Partial<ProductFormData>;
    }) => updateProduct(id, productData),
    onSuccess: (response, variables) => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
};

export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) => bulkDeleteProducts(productIds),
    onSuccess: (response, productIds) => {
      toast.success(`${productIds.length} products deleted successfully`);
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete products");
    },
  });
};

export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      updates: { productId: string; data: Partial<ProductFormData> }[]
    ) => bulkUpdateProducts(updates),
    onSuccess: (response, updates) => {
      toast.success(
        `${
          response.data?.modifiedCount || updates.length
        } products updated successfully`
      );
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update products");
    },
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "draft" | "active" | "inactive" | "discontinued";
    }) => updateProductStatus(id, status),
    onSuccess: (response, variables) => {
      toast.success("Product status updated successfully");
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product status");
    },
  });
};

export const useUploadProductImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => uploadProductImages(files),
    onSuccess: () => {
      toast.success("Images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
    },
  });
};

export const useAddProductReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      reviewData,
    }: {
      productId: string;
      reviewData: { rating: number; comment: string; title?: string };
    }) => addProductReview(productId, reviewData),
    onSuccess: (response, variables) => {
      toast.success("Review added successfully");
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(variables.productId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add review");
    },
  });
};
