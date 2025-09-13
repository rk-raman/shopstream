"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMyCollections,
  getCollections,
  getCollection,
  getCollectionByHandle,
  getCollectionProducts,
  getPublishedCollections,
  searchCollections,
  getCollectionsBySeller,
  getCollectionStats,
  createCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  addProductsToCollection,
  removeProductsFromCollection,
  updateCollectionVisibility,
  bulkUpdateCollections,
  uploadCollectionImage,
  removeCollectionImage,
  CollectionFilters,
  BulkUpdateItem,
  CollectionStats,
} from "../services/collectionService";
import { Collection, CollectionFormData } from "@/types/global";

// Query Keys
export const COLLECTION_QUERY_KEYS = {
  all: ["collections"] as const,
  lists: () => [...COLLECTION_QUERY_KEYS.all, "list"] as const,
  list: (filters: CollectionFilters) =>
    [...COLLECTION_QUERY_KEYS.lists(), filters] as const,
  myCollections: (options: {
    includeHidden?: boolean;
    includeUnpublished?: boolean;
  }) => [...COLLECTION_QUERY_KEYS.all, "my", options] as const,
  details: () => [...COLLECTION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...COLLECTION_QUERY_KEYS.details(), id] as const,
  products: (id: string, options: any) =>
    [...COLLECTION_QUERY_KEYS.detail(id), "products", options] as const,
  published: (options: any) =>
    [...COLLECTION_QUERY_KEYS.all, "published", options] as const,
  bySeller: (sellerId: string, options: any) =>
    [...COLLECTION_QUERY_KEYS.all, "seller", sellerId, options] as const,
  search: (query: string, options: any) =>
    [...COLLECTION_QUERY_KEYS.all, "search", query, options] as const,
  stats: (sellerId?: string) =>
    [...COLLECTION_QUERY_KEYS.all, "stats", sellerId] as const,
};

// ==================== QUERY HOOKS ====================

// Get all collections (public)
export const useCollections = (filters: CollectionFilters = {}) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.list(filters),
    queryFn: () => getCollections(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// Get single collection
export const useCollection = (
  id: string,
  includeProducts: boolean = false,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.detail(id),
    queryFn: () => getCollection(id, includeProducts),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get collection by handle
export const useCollectionByHandle = (
  handle: string,
  includeProducts: boolean = false,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...COLLECTION_QUERY_KEYS.details(), "handle", handle],
    queryFn: () => getCollectionByHandle(handle, includeProducts),
    enabled: enabled && !!handle,
    staleTime: 5 * 60 * 1000,
  });
};

// Get collection products
export const useCollectionProducts = (
  id: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    populate?: boolean;
  } = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.products(id, options),
    queryFn: () => getCollectionProducts(id, options),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Get published collections
export const usePublishedCollections = (
  options: {
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}
) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.published(options),
    queryFn: () => getPublishedCollections(options),
    staleTime: 5 * 60 * 1000,
  });
};

// Search collections
export const useSearchCollections = (
  query: string,
  options: {
    limit?: number;
    sellerId?: string;
  } = {}
) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.search(query, options),
    queryFn: () => searchCollections(query, options),
    enabled: !!query,
    staleTime: 2 * 60 * 1000,
  });
};

// Get collections by seller
export const useCollectionsBySeller = (
  sellerId: string,
  options: {
    includeHidden?: boolean;
    includeUnpublished?: boolean;
  } = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.bySeller(sellerId, options),
    queryFn: () => getCollectionsBySeller(sellerId, options),
    enabled: enabled && !!sellerId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get seller's collections (authenticated)
export const useMyCollections = (
  options: {
    includeHidden?: boolean;
    includeUnpublished?: boolean;
  } = {}
) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.myCollections(options),
    queryFn: () => getMyCollections(options),
    staleTime: 5 * 60 * 1000,
  });
};

// Get collection statistics
export const useCollectionStats = (sellerId?: string) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.stats(sellerId),
    queryFn: () => getCollectionStats(sellerId),
    staleTime: 2 * 60 * 1000,
  });
};

// ==================== MUTATION HOOKS ====================

// Create collection
export const useCreateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionData: CollectionFormData) =>
      createCollection(collectionData),
    onSuccess: (response) => {
      toast.success("Collection created successfully");
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create collection");
    },
  });
};

// Update collection
export const useUpdateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      collectionData,
    }: {
      id: string;
      collectionData: Partial<CollectionFormData>;
    }) => updateCollection(id, collectionData),
    onSuccess: (response, variables) => {
      toast.success("Collection updated successfully");
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update collection");
    },
  });
};

// Delete collection
export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => deleteCollection(collectionId),
    onSuccess: () => {
      toast.success("Collection deleted successfully");
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete collection");
    },
  });
};

// Duplicate collection
export const useDuplicateCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => duplicateCollection(collectionId),
    onSuccess: () => {
      toast.success("Collection duplicated successfully");
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to duplicate collection");
    },
  });
};

// Update collection visibility
export const useUpdateCollectionVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      updateCollectionVisibility(id, isVisible),
    onSuccess: (response, variables) => {
      toast.success(
        `Collection ${variables.isVisible ? "shown" : "hidden"} successfully`
      );
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update collection visibility");
    },
  });
};

// Add products to collection
export const useAddProductsToCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productIds }: { id: string; productIds: string[] }) =>
      addProductsToCollection(id, productIds),
    onSuccess: (response, variables) => {
      toast.success(
        `${variables.productIds.length} products added to collection`
      );
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add products to collection");
    },
  });
};

// Remove products from collection
export const useRemoveProductsFromCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, productIds }: { id: string; productIds: string[] }) =>
      removeProductsFromCollection(id, productIds),
    onSuccess: (response, variables) => {
      toast.success(
        `${variables.productIds.length} products removed from collection`
      );
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove products from collection");
    },
  });
};

// Bulk update collections
export const useBulkUpdateCollections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: BulkUpdateItem[]) => bulkUpdateCollections(updates),
    onSuccess: (response) => {
      toast.success(
        `${response.data.updated} collections updated successfully`
      );
      if (response.data.errors.length > 0) {
        toast.warning(
          `${response.data.errors.length} collections failed to update`
        );
      }
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to bulk update collections");
    },
  });
};

// Upload collection image
export const useUploadCollectionImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadCollectionImage(id, file),
    onSuccess: (response, variables) => {
      toast.success("Collection image uploaded successfully");
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.detail(variables.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload collection image");
    },
  });
};

// Remove collection image
export const useRemoveCollectionImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: string) => removeCollectionImage(collectionId),
    onSuccess: (response, collectionId) => {
      toast.success("Collection image removed successfully");
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COLLECTION_QUERY_KEYS.detail(collectionId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove collection image");
    },
  });
};
