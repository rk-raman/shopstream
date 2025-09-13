import { ApiResponse, Product } from "@/types/global";
import { API_CONFIG } from "@/constants/constants";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axiosSeller from "@/lib/api/axiosSeller";

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

// Get all products with filters (seller's products)
export const getMyProducts = async (
  filters: ProductFilters = {}
): Promise<ApiResponse<ProductListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getMyProducts();
    const queryParams = buildQueryParams(filters);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

// Get all products with filters (public endpoint)
export const getProducts = async (
  filters: ProductFilters = {}
): Promise<ApiResponse<ProductListResponse>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProducts();
    const queryParams = buildQueryParams(filters);
    const url = queryParams ? `${endpoint.url}?${queryParams}` : endpoint.url;

    const response = await axiosSeller.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

// Get single product by ID
export const getProduct = async (id: string): Promise<ApiResponse<Product>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProduct(id);
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
};

// Get product by slug
export const getProductBySlug = async (
  slug: string
): Promise<ApiResponse<Product>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProductBySlug(slug);
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
};

// Create new product
export const createProduct = async (
  productData: ProductFormData
): Promise<ApiResponse<Product>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.createProduct();
    const response = await axiosSeller.post(endpoint.url, productData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create product"
    );
  }
};

// Update product
export const updateProduct = async (
  id: string,
  productData: Partial<ProductFormData>
): Promise<ApiResponse<Product>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.updateProduct(id);
    const response = await axiosSeller.put(endpoint.url, productData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update product"
    );
  }
};

// Delete product
export const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.deleteProduct(id);
    const response = await axiosSeller.delete(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete product"
    );
  }
};

// Bulk delete products
export const bulkDeleteProducts = async (
  productIds: string[]
): Promise<ApiResponse<{ deletedCount: number }>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.bulkDeleteProducts();
    const response = await axiosSeller.delete(endpoint.url, {
      data: { productIds },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete products"
    );
  }
};

// Bulk update products
export const bulkUpdateProducts = async (
  updates: { productId: string; data: Partial<ProductFormData> }[]
): Promise<ApiResponse<{ modifiedCount: number }>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.bulkUpdateProducts();
    const response = await axiosSeller.put(endpoint.url, { updates });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update products"
    );
  }
};

// Update product status
export const updateProductStatus = async (
  id: string,
  status: "draft" | "active" | "inactive" | "discontinued"
): Promise<ApiResponse<Product>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.updateProductStatus(id);
    const response = await axiosSeller.patch(endpoint.url, { status });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update product status"
    );
  }
};

// Upload product images
export const uploadProductImages = async (
  files: File[]
): Promise<ApiResponse<{ urls: string[] }>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.uploadProductImages();
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const response = await axiosSeller.post(endpoint.url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload images");
  }
};

// Get categories
export const getCategories = async (): Promise<ApiResponse<any[]>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getCategories();
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
};

// Get brands
export const getBrands = async (): Promise<ApiResponse<any[]>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getBrands();
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch brands");
  }
};

// Get product statistics
export const getProductStats = async (): Promise<ApiResponse<any>> => {
  try {
    const endpoint = API_ENDPOINTS.PRODUCTS.getProductStats();
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch product statistics"
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

    const response = await axiosSeller.get(url);
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

    const response = await axiosSeller.get(url);
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
    const response = await axiosSeller.post(endpoint.url, reviewData);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to add product review"
    );
  }
};

// Export all functions as default object for backward compatibility
export default {
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
