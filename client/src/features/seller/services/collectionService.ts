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
  sortBy?: "name" | "createdAt" | "productCount";
  sortOrder?: "asc" | "desc";
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

// Get all collections with filters (seller's collections)
export const getMyCollections = async (
  filters: CollectionFilters = {}
): Promise<ApiResponse<CollectionListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getMyCollections();
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
  id: string
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollection(id);
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collection"
    );
  }
};

// Get collection by handle
export const getCollectionByHandle = async (
  handle: string
): Promise<ApiResponse<Collection>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollectionByHandle(handle);
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collection"
    );
  }
};

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

// Bulk delete collections
export const bulkDeleteCollections = async (
  collectionIds: string[]
): Promise<ApiResponse<{ deletedCount: number }>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.bulkDeleteCollections();
    const response = await axiosSeller.delete(endpoint.url, {
      data: { collectionIds },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete collections"
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

// Upload collection image
export const uploadCollectionImage = async (
  file: File
): Promise<ApiResponse<{ url: string }>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.uploadCollectionImage();
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosSeller.post(endpoint.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload image");
  }
};

// Get collection statistics
export const getCollectionStats = async (): Promise<ApiResponse<any>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.getCollectionStats();
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch collection statistics"
    );
  }
};

// Search collections
export const searchCollections = async (
  query: string,
  filters: CollectionFilters = {}
): Promise<ApiResponse<CollectionListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.COLLECTIONS.searchCollections();
    const searchFilters = { ...filters, search: query };
    const queryParams = buildQueryParams(searchFilters);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to search collections"
    );
  }
};

// Export all functions as default object for backward compatibility
export default {
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
};
