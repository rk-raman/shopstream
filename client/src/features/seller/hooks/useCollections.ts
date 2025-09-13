"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMyCollections,
  getCollections,
  getCollection,
  getCollectionByHandle,
  createCollection,
  updateCollection,
  deleteCollection,
  bulkDeleteCollections,
  addProductsToCollection,
  removeProductsFromCollection,
  updateCollectionVisibility,
  uploadCollectionImage,
  getCollectionStats,
  searchCollections,
  CollectionFilters,
} from "../services/collectionService";
import { Collection, CollectionFormData } from "@/types/global";

// Query Keys
export const COLLECTION_QUERY_KEYS = {
  all: ["collections"] as const,
  lists: () => [...COLLECTION_QUERY_KEYS.all, "list"] as const,
  list: (filters: CollectionFilters) =>
    [...COLLECTION_QUERY_KEYS.lists(), filters] as const,
  myCollections: (filters: CollectionFilters) =>
    [...COLLECTION_QUERY_KEYS.all, "my", filters] as const,
  details: () => [...COLLECTION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...COLLECTION_QUERY_KEYS.details(), id] as const,
  search: (query: string, options: CollectionFilters) =>
    [...COLLECTION_QUERY_KEYS.all, "search", query, options] as const,
  stats: () => [...COLLECTION_QUERY_KEYS.all, "stats"] as const,
};

// Get seller's collections
export const useMyCollections = (filters: CollectionFilters = {}) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.myCollections(filters),
    queryFn: () => getMyCollections(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get all collections (public)
export const useCollections = (filters: CollectionFilters = {}) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.list(filters),
    queryFn: () => getCollections(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// Get single collection
export const useCollection = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.detail(id),
    queryFn: () => getCollection(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get collection by handle
export const useCollectionByHandle = (
  handle: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...COLLECTION_QUERY_KEYS.details(), "handle", handle],
    queryFn: () => getCollectionByHandle(handle),
    enabled: enabled && !!handle,
    staleTime: 5 * 60 * 1000,
  });
};

// Search collections
export const useSearchCollections = (
  query: string,
  options: CollectionFilters = {}
) => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.search(query, options),
    queryFn: () => searchCollections(query, options),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Get collection statistics
export const useCollectionStats = () => {
  return useQuery({
    queryKey: COLLECTION_QUERY_KEYS.stats(),
    queryFn: () => getCollectionStats(),
    staleTime: 2 * 60 * 1000,
  });
};

// Mutation hooks
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

export const useBulkDeleteCollections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionIds: string[]) =>
      bulkDeleteCollections(collectionIds),
    onSuccess: (response, collectionIds) => {
      toast.success(`${collectionIds.length} collections deleted successfully`);
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete collections");
    },
  });
};

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

export const useUploadCollectionImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadCollectionImage(file),
    onSuccess: () => {
      toast.success("Collection image uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload collection image");
    },
  });
};
