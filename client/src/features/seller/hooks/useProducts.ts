import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  productService,
  ProductFilters,
  ProductFormData,
} from "../services/productService";
import { Product } from "@/types/global";

// Hook for fetching products with filters
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching a single product
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProduct(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for creating a product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductFormData) =>
      productService.createProduct(productData),
    onSuccess: (response) => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      return response.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
      throw error;
    },
  });
};

// Hook for updating a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ProductFormData>;
    }) => productService.updateProduct(id, data),
    onSuccess: (response, variables) => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      return response.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
      throw error;
    },
  });
};

// Hook for deleting a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
      throw error;
    },
  });
};

// Hook for bulk deleting products
export const useBulkDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productIds: string[]) =>
      productService.bulkDeleteProducts(productIds),
    onSuccess: (_, productIds) => {
      toast.success(`${productIds.length} products deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete products");
      throw error;
    },
  });
};

// Hook for bulk updating products
export const useBulkUpdateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productIds,
      updates,
    }: {
      productIds: string[];
      updates: Partial<ProductFormData>;
    }) => productService.bulkUpdateProducts(productIds, updates),
    onSuccess: (_, { productIds }) => {
      toast.success(`${productIds.length} products updated successfully`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update products");
      throw error;
    },
  });
};

// Hook for uploading product images
export const useUploadImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => productService.uploadImages(files),
    onSuccess: (response) => {
      toast.success("Images uploaded successfully");
      return response.data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
      throw error;
    },
  });
};

// Hook for fetching categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    refetchOnWindowFocus: false,
  });
};

// Combined hook for product management
export const useProductManagement = () => {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkDeleteProducts = useBulkDeleteProducts();
  const bulkUpdateProducts = useBulkUpdateProducts();
  const uploadImages = useUploadImages();

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateProducts,
    uploadImages,
    isLoading:
      createProduct.isPending ||
      updateProduct.isPending ||
      deleteProduct.isPending ||
      bulkDeleteProducts.isPending ||
      bulkUpdateProducts.isPending ||
      uploadImages.isPending,
  };
};
