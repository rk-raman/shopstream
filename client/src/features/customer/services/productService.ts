import { ApiResponse, Product } from "@/types/global";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axiosCustomer from "@/lib/api/axiosCustomer";

export interface ProductFormData {
  name: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  discountPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  stock: number;
  sku?: string;
  images: string[];
  tags?: string[];
  specifications?: { name: string; value: string; category?: string }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  shippingClass?: string;
  freeShipping?: boolean;
  shippingCost?: number;
  lowStockThreshold?: number;
  isDigital?: boolean;
  status?: "draft" | "active" | "inactive" | "discontinued";
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  status?: string;
  isApproved?: boolean;
  sortBy?: "name" | "basePrice" | "createdAt" | "rating.average" | "salesCount";
  sortOrder?: "asc" | "desc";
  featured?: boolean;
}

export interface ProductListResponse {
  docs: Product[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  meta?: any;
}

// Helper function to build query parameters
const buildQueryParams = (filters: ProductFilters): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  return params.toString();
};

// Get all products with filters (public endpoint)
export const getProducts = async (
  filters: ProductFilters = {}
): Promise<ApiResponse<ProductListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProducts();
    const queryParams = buildQueryParams(filters);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosCustomer.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

// Get all products with filters (public endpoint)
export const getFeatureProducts = async (
  filters: ProductFilters = {}
): Promise<ApiResponse<ProductListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getFeatureProducts();
    const queryParams = buildQueryParams(filters);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosCustomer.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

// Get product by slug
export const getProductBySlug = async (
  slug: string
): Promise<ApiResponse<Product>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProductBySlug(slug);
    const response = await axiosCustomer.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
};

// Get product by id
export const getProductById = async (
  id: any
): Promise<ApiResponse<Product>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProduct(id);
    const response = await axiosCustomer.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
};

// Get categories
export const getCategories = async (): Promise<ApiResponse<any[]>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getCategories();
    const response = await axiosCustomer.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
};

// Search products
export const searchProducts = async (
  query: string,
  filters: ProductFilters = {}
): Promise<ApiResponse<ProductListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.searchProducts();
    const searchFilters = { ...filters, search: query };
    const queryParams = buildQueryParams(searchFilters);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosCustomer.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to search products"
    );
  }
};

// Get product reviews
export const getProductReviews = async (
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<any>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProductReviews(productId);
    const queryParams = buildQueryParams({ page, limit });
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosCustomer.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch product reviews"
    );
  }
};

// Add product review
export const addProductReview = async (
  productId: string,
  reviewData: {
    rating: number;
    comment: string;
    title?: string;
  }
): Promise<ApiResponse<any>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.addProductReview(productId);
    const response = await axiosCustomer.post(endpoint.url, reviewData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add product review"
    );
  }
};

// Export all functions as default object for backward compatibility
export default {
  getProducts,
  getProductBySlug,

  getCategories,

  searchProducts,
  getProductReviews,
  addProductReview,
};
