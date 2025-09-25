import axios from "axios";
import { API_ENDPOINTS } from "../constants/endpoints";
import { Category, ApiResponse } from "../types/global";

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

export interface CategoryFormData {
  name: string;
  description?: string;
  shortDescription?: string;
  parent?: string;
  image?: string;
  icon?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  attributes?: CategoryAttribute[];
  commission?: number;
}

export interface CategoryAttribute {
  name: string;
  type: "text" | "number" | "select" | "multiselect" | "boolean";
  options?: string[];
  isRequired?: boolean;
  isFilterable?: boolean;
  isSearchable?: boolean;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  parent?: string;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
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

// Get all categories
export const getCategories = async (
  filters: CategoryFilters = {}
): Promise<ApiResponse<{ categories: Category[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.CATEGORIES.BASE}${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Get category tree
export const getCategoryTree = async (): Promise<
  ApiResponse<CategoryTree[]>
> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.CATEGORIES.GET_TREE);
  return response.data;
};

// Get single category by ID
export const getCategory = async (
  id: string
): Promise<ApiResponse<Category>> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
  return response.data;
};

// Get featured categories
export const getFeaturedCategories = async (): Promise<
  ApiResponse<Category[]>
> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.CATEGORIES.GET_FEATURED);
  return response.data;
};

// Create new category
export const createCategory = async (
  categoryData: CategoryFormData
): Promise<ApiResponse<Category>> => {
  const api = createAxiosInstance();
  const response = await api.post(
    API_ENDPOINTS.CATEGORIES.CREATE,
    categoryData
  );
  return response.data;
};

// Update category
export const updateCategory = async (
  id: string,
  categoryData: Partial<CategoryFormData>
): Promise<ApiResponse<Category>> => {
  const api = createAxiosInstance();
  const response = await api.put(
    API_ENDPOINTS.CATEGORIES.UPDATE(id),
    categoryData
  );
  return response.data;
};

// Delete category
export const deleteCategory = async (
  id: string
): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  return response.data;
};

// Bulk delete categories
export const bulkDeleteCategories = async (
  categoryIds: string[]
): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.post(API_ENDPOINTS.CATEGORIES.BULK_DELETE, {
    categoryIds,
  });
  return response.data;
};

// Bulk update categories
export const bulkUpdateCategories = async (
  categoryIds: string[],
  updateData: Partial<CategoryFormData>
): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.post(API_ENDPOINTS.CATEGORIES.BULK_UPDATE, {
    categoryIds,
    updateData,
  });
  return response.data;
};

// Search categories
export const searchCategories = async (
  query: string,
  filters: CategoryFilters = {}
): Promise<ApiResponse<{ categories: Category[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams({ ...filters, q: query });
  const url = `${API_ENDPOINTS.CATEGORIES.SEARCH}?${queryString}`;
  const response = await api.get(url);
  return response.data;
};

// Upload category image
export const uploadCategoryImage = async (
  id: string,
  file: File
): Promise<ApiResponse<{ url: string }>> => {
  const api = createAxiosInstance();
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post(
    API_ENDPOINTS.CATEGORIES.UPLOAD_IMAGE(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Get root categories (level 0)
export const getRootCategories = async (): Promise<ApiResponse<Category[]>> => {
  const api = createAxiosInstance();
  const response = await api.get(
    `${API_ENDPOINTS.CATEGORIES.BASE}?level=0&isActive=true`
  );
  return response.data;
};

// Get child categories
export const getChildCategories = async (
  parentId: string
): Promise<ApiResponse<Category[]>> => {
  const api = createAxiosInstance();
  const response = await api.get(
    `${API_ENDPOINTS.CATEGORIES.BASE}?parent=${parentId}&isActive=true`
  );
  return response.data;
};

// Get category path (breadcrumb)
export const getCategoryPath = async (
  id: string
): Promise<ApiResponse<Category[]>> => {
  const api = createAxiosInstance();
  const response = await api.get(
    `${API_ENDPOINTS.CATEGORIES.GET_BY_ID(id)}/path`
  );
  return response.data;
};

// Export all functions as default object for backward compatibility
const categoryService = {
  getCategories,
  getCategoryTree,
  getCategory,
  getFeaturedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  bulkUpdateCategories,
  searchCategories,
  uploadCategoryImage,
  getRootCategories,
  getChildCategories,
  getCategoryPath,
};

export default categoryService;
