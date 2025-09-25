import axios from "axios";
import { API_ENDPOINTS } from "../constants/endpoints";
import { Product, ProductFormData, ApiResponse } from "../types/global";

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

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  inStock?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  inactiveProducts: number;
  discontinuedProducts: number;
  totalViews: number;
  totalSales: number;
  averageRating: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

// Get all products for seller
export const getMyProducts = async (
  filters: ProductFilters = {}
): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.PRODUCTS.GET_MY_PRODUCTS}${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Get all products (public)
export const getProducts = async (
  filters: ProductFilters = {}
): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.PRODUCTS.BASE}${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Get single product by ID
export const getProduct = async (id: string): Promise<ApiResponse<Product>> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
  return response.data;
};

// Get single product by slug
export const getProductBySlug = async (
  slug: string
): Promise<ApiResponse<Product>> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.PRODUCTS.GET_BY_SLUG(slug));
  return response.data;
};

// Create new product
export const createProduct = async (
  productData: ProductFormData
): Promise<ApiResponse<Product>> => {
  const api = createAxiosInstance();
  const response = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
  return response.data;
};

// Update product
export const updateProduct = async (
  id: string,
  productData: Partial<ProductFormData>
): Promise<ApiResponse<Product>> => {
  const api = createAxiosInstance();
  const response = await api.put(
    API_ENDPOINTS.PRODUCTS.UPDATE(id),
    productData
  );
  return response.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  return response.data;
};

// Bulk delete products
export const bulkDeleteProducts = async (
  productIds: string[]
): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.post(API_ENDPOINTS.PRODUCTS.BULK_DELETE, {
    productIds,
  });
  return response.data;
};

// Bulk update products
export const bulkUpdateProducts = async (
  productIds: string[],
  updateData: Partial<ProductFormData>
): Promise<ApiResponse<void>> => {
  const api = createAxiosInstance();
  const response = await api.post(API_ENDPOINTS.PRODUCTS.BULK_UPDATE, {
    productIds,
    updateData,
  });
  return response.data;
};

// Update product status
export const updateProductStatus = async (
  id: string,
  status: string
): Promise<ApiResponse<Product>> => {
  const api = createAxiosInstance();
  const response = await api.patch(API_ENDPOINTS.PRODUCTS.UPDATE_STATUS(id), {
    status,
  });
  return response.data;
};

// Upload product images
export const uploadProductImages = async (
  files: File[]
): Promise<ApiResponse<string[]>> => {
  const api = createAxiosInstance();
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await api.post(
    API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGES,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Get categories
export const getCategories = async (): Promise<ApiResponse<any[]>> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.CATEGORIES.BASE);
  return response.data;
};

// Get brands
export const getBrands = async (): Promise<ApiResponse<any[]>> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.BRANDS.BASE);
  return response.data;
};

// Get product statistics
export const getProductStats = async (): Promise<ApiResponse<ProductStats>> => {
  const api = createAxiosInstance();
  const response = await api.get(API_ENDPOINTS.PRODUCTS.STATS);
  return response.data;
};

// Search products
export const searchProducts = async (
  query: string,
  filters: ProductFilters = {}
): Promise<ApiResponse<{ products: Product[]; pagination: any }>> => {
  const api = createAxiosInstance();
  const queryString = buildQueryParams({ ...filters, q: query });
  const url = `${API_ENDPOINTS.PRODUCTS.SEARCH}?${queryString}`;
  const response = await api.get(url);
  return response.data;
};

// Get product reviews
export const getProductReviews = async (
  id: string,
  page = 1,
  limit = 10
): Promise<ApiResponse<any>> => {
  const api = createAxiosInstance();
  const response = await api.get(
    `${API_ENDPOINTS.PRODUCTS.REVIEWS(id)}?page=${page}&limit=${limit}`
  );
  return response.data;
};

// Add product review
export const addProductReview = async (
  id: string,
  reviewData: any
): Promise<ApiResponse<any>> => {
  const api = createAxiosInstance();
  const response = await api.post(
    API_ENDPOINTS.PRODUCTS.ADD_REVIEW(id),
    reviewData
  );
  return response.data;
};

// Export all functions as default object for backward compatibility
const productService = {
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
};

export default productService;
