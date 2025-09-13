import { ApiResponse, Collection, CollectionFormData } from "@/types/global";
import { API_CONFIG } from "@/constants/constants";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axiosSeller from "@/lib/api/axiosSeller";

export interface CollectionFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: "manual" | "automated";
  isVisible?: boolean;
  isPublished?: boolean;
  sellerId?: string;
  sortBy?: "name" | "createdAt" | "updatedAt" | "productCount" | "viewCount";
  sortOrder?: "asc" | "desc";
  includeHidden?: boolean;
  includeUnpublished?: boolean;
}

export interface CollectionListResponse {
  docs: Collection[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface CollectionStats {
  totalCollections: number;
  publishedCollections: number;
  visibleCollections: number;
  manualCollections: number;
  automatedCollections: number;
  totalProducts: number;
  totalViews: number;
  avgProductsPerCollection: number;
}

export interface BulkUpdateItem {
  collectionId: string;
  name?: string;
  description?: string;
  isVisible?: boolean;
  isPublished?: boolean;
  sortOrder?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface BulkUpdateResult {
  updated: number;
  errors: Array<{
    collectionId: string;
    error: string;
  }>;
}

// Helper function to build query parameters
const buildQueryParams = (filters: CollectionFilters): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  return params.toString();
};

// ==================== PUBLIC ENDPOINTS ====================

// Get all collections with filters (public endpoint)
export const getCollections = async (
  filters: CollectionFilters = {}
): Promise<ApiResponse<CollectionListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollections();
    const queryParams = buildQueryParams(filters);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collections"
    );
  }
};

// Get single collection by ID
export const getCollection = async (
  id: string,
  includeProducts: boolean = false
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollection(id);
    const url = includeProducts
      ? `${endpoint.url}?includeProducts=true`
      : endpoint.url;
    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collection"
    );
  }
};

// Get collection by handle
export const getCollectionByHandle = async (
  handle: string,
  includeProducts: boolean = false
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollectionByHandle(handle);
    const url = includeProducts
      ? `${endpoint.url}?includeProducts=true`
      : endpoint.url;
    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collection"
    );
  }
};

// Get collection products
export const getCollectionProducts = async (
  id: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    populate?: boolean;
  } = {}
): Promise<ApiResponse<any>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollectionProducts(id);
    const queryParams = buildQueryParams(options as any);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collection products"
    );
  }
};

// Get published collections
export const getPublishedCollections = async (
  options: {
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}
): Promise<ApiResponse<Collection[]>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getPublishedCollections();
    const queryParams = buildQueryParams(options as any);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch published collections"
    );
  }
};

// Search collections
export const searchCollections = async (
  query: string,
  options: {
    limit?: number;
    sellerId?: string;
  } = {}
): Promise<ApiResponse<Collection[]>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.searchCollections();
    const searchParams = { q: query, ...options };
    const queryParams = buildQueryParams(searchParams as any);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to search collections"
    );
  }
};

// Get collections by seller
export const getCollectionsBySeller = async (
  sellerId: string,
  options: {
    includeHidden?: boolean;
    includeUnpublished?: boolean;
  } = {}
): Promise<ApiResponse<Collection[]>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollectionsBySeller(sellerId);
    const queryParams = buildQueryParams(options as any);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch seller collections"
    );
  }
};

// ==================== AUTHENTICATED ENDPOINTS ====================

// Get my collections (authenticated seller)
export const getMyCollections = async (
  options: {
    includeHidden?: boolean;
    includeUnpublished?: boolean;
  } = {}
): Promise<ApiResponse<Collection[]>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getMyCollections();
    const queryParams = buildQueryParams(options as any);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch your collections"
    );
  }
};

// Get collection statistics
export const getCollectionStats = async (
  sellerId?: string
): Promise<ApiResponse<CollectionStats>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollectionStats();
    const url = sellerId
      ? `${endpoint.url}?sellerId=${sellerId}`
      : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collection statistics"
    );
  }
};

// ==================== SELLER/ADMIN ENDPOINTS ====================

// Create new collection
export const createCollection = async (
  collectionData: CollectionFormData
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.createCollection();
    const response = await axiosSeller.post(endpoint.url, collectionData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create collection"
    );
  }
};

// Update collection
export const updateCollection = async (
  id: string,
  collectionData: Partial<CollectionFormData>
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.updateCollection(id);
    const response = await axiosSeller.put(endpoint.url, collectionData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update collection"
    );
  }
};

// Delete collection
export const deleteCollection = async (
  id: string
): Promise<ApiResponse<void>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.deleteCollection(id);
    const response = await axiosSeller.delete(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete collection"
    );
  }
};

// Duplicate collection
export const duplicateCollection = async (
  id: string
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.duplicateCollection(id);
    const response = await axiosSeller.post(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to duplicate collection"
    );
  }
};

// Update collection visibility
export const updateCollectionVisibility = async (
  id: string,
  isVisible: boolean
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.updateCollectionVisibility(id);
    const response = await axiosSeller.patch(endpoint.url, { isVisible });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update collection visibility"
    );
  }
};

// Add products to collection
export const addProductsToCollection = async (
  id: string,
  productIds: string[]
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.addProductsToCollection(id);
    const response = await axiosSeller.post(endpoint.url, { productIds });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add products to collection"
    );
  }
};

// Remove products from collection
export const removeProductsFromCollection = async (
  id: string,
  productIds: string[]
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.removeProductsFromCollection(id);
    const response = await axiosSeller.delete(endpoint.url, {
      data: { productIds },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to remove products from collection"
    );
  }
};

// Bulk update collections
export const bulkUpdateCollections = async (
  updates: BulkUpdateItem[]
): Promise<ApiResponse<BulkUpdateResult>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.bulkUpdateCollections();
    const response = await axiosSeller.patch(endpoint.url, { updates });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to bulk update collections"
    );
  }
};

// Upload collection image
export const uploadCollectionImage = async (
  id: string,
  file: File
): Promise<ApiResponse<{ collection: Collection; image: any }>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.uploadCollectionImage(id);
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosSeller.post(endpoint.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to upload collection image"
    );
  }
};

// Remove collection image
export const removeCollectionImage = async (
  id: string
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.removeCollectionImage(id);
    const response = await axiosSeller.delete(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to remove collection image"
    );
  }
};

// Export all functions as default object for backward compatibility
export default {
  // Public endpoints
  getCollections,
  getCollection,
  getCollectionByHandle,
  getCollectionProducts,
  getPublishedCollections,
  searchCollections,
  getCollectionsBySeller,

  // Authenticated endpoints
  getMyCollections,
  getCollectionStats,

  // Seller/Admin endpoints
  createCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  updateCollectionVisibility,
  addProductsToCollection,
  removeProductsFromCollection,
  bulkUpdateCollections,
  uploadCollectionImage,
  removeCollectionImage,
};
