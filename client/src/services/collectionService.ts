import axios from "axios";
import { API_ENDPOINTS } from "../constants/endpoints";
import { Collection, CollectionFormData, ApiResponse } from "../types/global";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Create axios instance with seller token
const createAxiosInstance = () => {
  const token = localStorage.getItem("sellerToken");
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

export interface CollectionFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: "manual" | "automated";
  isVisible?: boolean;
  isPublished?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Helper function to build query parameters
const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  return searchParams.toString();
};

// Get all collections for seller
export const getMyCollections = async (
  filters: CollectionFilters = {}
): Promise<ApiResponse<{ collections: Collection[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.COLLECTIONS.GET_MY_COLLECTIONS}${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Get all collections (public)
export const getCollections = async (
  filters: CollectionFilters = {}
): Promise<ApiResponse<{ collections: Collection[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.COLLECTIONS.BASE}${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Get single collection by ID
export const getCollection = async (
  id: string
): Promise<ApiResponse<Collection>> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.COLLECTIONS.GET_BY_ID(id));
  return response.data;
};

// Get single collection by handle
export const getCollectionByHandle = async (
  handle: string
): Promise<ApiResponse<Collection>> => {
  const api = createAxiosInstance();
  const response = await api.get(
    API_ENDPOINTS.COLLECTIONS.GET_BY_HANDLE(handle)
  );
  return response.data;
};

// Create new collection
export const createCollection = async (
  collectionData: CollectionFormData
): Promise<ApiResponse<Collection>> => {
  const api = createAxiosInstance();
  const response = await api.post(
    API_ENDPOINTS.COLLECTIONS.CREATE,
    collectionData
  );
  return response.data;
};

// Update collection
export const updateCollection = async (
  id: string,
  collectionData: Partial<CollectionFormData>
): Promise<ApiResponse<Collection>> => {
  const api = createAxiosInstance();
  const response = await api.put(
    API_ENDPOINTS.COLLECTIONS.UPDATE(id),
    collectionData
  );
  return response.data;
};

// Delete collection
export const deleteCollection = async (
  id: string
): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.delete(API_ENDPOINTS.COLLECTIONS.DELETE(id));
  return response.data;
};

// Bulk delete collections
export const bulkDeleteCollections = async (
  collectionIds: string[]
): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.post(API_ENDPOINTS.COLLECTIONS.BULK_DELETE, {
    collectionIds,
  });
  return response.data;
};

// Add products to collection
export const addProductsToCollection = async (
  id: string,
  productIds: string[]
): Promise<ApiResponse<Collection>> => {
  const api = createAxiosInstance();
  const response = await api.post(API_ENDPOINTS.COLLECTIONS.ADD_PRODUCTS(id), {
    productIds,
  });
  return response.data;
};

// Remove products from collection
export const removeProductsFromCollection = async (
  id: string,
  productIds: string[]
): Promise<ApiResponse<Collection>> => {
  const api = createAxiosInstance();
  const response = await api.post(
    API_ENDPOINTS.COLLECTIONS.REMOVE_PRODUCTS(id),
    { productIds }
  );
  return response.data;
};

// Search collections
export const searchCollections = async (
  query: string,
  filters: CollectionFilters = {}
): Promise<ApiResponse<{ collections: Collection[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams({ ...filters, q: query });
  const url = `${API_ENDPOINTS.COLLECTIONS.SEARCH}?${queryString}`;
  const response = await api.get(url);
  return response.data;
};

// Upload collection image
export const uploadCollectionImage = async (
  id: string,
  file: File
): Promise<ApiResponse<{ url: string }>> => {
  const api = createAxiosInstance();
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(
    API_ENDPOINTS.COLLECTIONS.UPLOAD_IMAGE(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Get collection products
export const getCollectionProducts = async (
  id: string,
  filters: any = {}
): Promise<ApiResponse<any>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.COLLECTIONS.GET_BY_ID(id)}/products${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Export all functions as default object for backward compatibility
const collectionService = {
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
  searchCollections,
  uploadCollectionImage,
  getCollectionProducts,
};

export default collectionService;
