import axiosSeller from "@/lib/api/axiosSeller";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  Brand,
  BrandFormData,
  ApiResponse,
  PaginatedResponse,
} from "@/types/global";

// Helper function to build query parameters
const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  return searchParams.toString();
};

// Get all brands with optional filters
export const getBrands = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  sortBy?: "name" | "productCount" | "viewCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}): Promise<PaginatedResponse<Brand>> => {
  const queryString = params ? buildQueryParams(params) : "";
  const url = `${API_ENDPOINTS.BRANDS}${queryString ? `?${queryString}` : ""}`;

  const response = await axiosSeller.get<PaginatedResponse<Brand>>(url);
  return response.data;
};

// Get active brands
export const getActiveBrands = async (): Promise<Brand[]> => {
  const response = await axiosSeller.get<ApiResponse<Brand[]>>(
    `${API_ENDPOINTS.BRANDS}/active`
  );
  return response.data.data;
};

// Get featured brands
export const getFeaturedBrands = async (): Promise<Brand[]> => {
  const response = await axiosSeller.get<ApiResponse<Brand[]>>(
    `${API_ENDPOINTS.BRANDS}/featured`
  );
  return response.data.data;
};

// Get verified brands
export const getVerifiedBrands = async (): Promise<Brand[]> => {
  const response = await axiosSeller.get<ApiResponse<Brand[]>>(
    `${API_ENDPOINTS.BRANDS}/verified`
  );
  return response.data.data;
};

// Get popular brands
export const getPopularBrands = async (limit?: number): Promise<Brand[]> => {
  const url = `${API_ENDPOINTS.BRANDS}/popular${
    limit ? `?limit=${limit}` : ""
  }`;
  const response = await axiosSeller.get<ApiResponse<Brand[]>>(url);
  return response.data.data;
};

// Get brands by category
export const getBrandsByCategory = async (
  categoryId: string
): Promise<Brand[]> => {
  const response = await axiosSeller.get<ApiResponse<Brand[]>>(
    `${API_ENDPOINTS.BRANDS}/category/${categoryId}`
  );
  return response.data.data;
};

// Get brands alphabetically grouped
export const getBrandsByAlphabet = async (): Promise<
  { _id: string; brands: Brand[] }[]
> => {
  const response = await axiosSeller.get<
    ApiResponse<{ _id: string; brands: Brand[] }[]>
  >(`${API_ENDPOINTS.BRANDS}/alphabet`);
  return response.data.data;
};

// Get single brand by ID
export const getBrand = async (id: string): Promise<Brand> => {
  const response = await axiosSeller.get<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/${id}`
  );
  return response.data.data;
};

// Get brand by slug
export const getBrandBySlug = async (slug: string): Promise<Brand> => {
  const response = await axiosSeller.get<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/slug/${slug}`
  );
  return response.data.data;
};

// Create new brand
export const createBrand = async (brandData: BrandFormData): Promise<Brand> => {
  const response = await axiosSeller.post<ApiResponse<Brand>>(
    API_ENDPOINTS.BRANDS,
    brandData
  );
  return response.data.data;
};

// Update brand
export const updateBrand = async (
  id: string,
  brandData: Partial<BrandFormData>
): Promise<Brand> => {
  const response = await axiosSeller.put<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/${id}`,
    brandData
  );
  return response.data.data;
};

// Delete brand
export const deleteBrand = async (id: string): Promise<void> => {
  await axiosSeller.delete(`${API_ENDPOINTS.BRANDS}/${id}`);
};

// Bulk delete brands
export const bulkDeleteBrands = async (brandIds: string[]): Promise<void> => {
  await axiosSeller.delete(`${API_ENDPOINTS.BRANDS}/bulk`, {
    data: { brandIds },
  });
};

// Update brand status
export const updateBrandStatus = async (
  id: string,
  isActive: boolean
): Promise<Brand> => {
  const response = await axiosSeller.patch<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/${id}/status`,
    {
      isActive,
    }
  );
  return response.data.data;
};

// Toggle featured status
export const toggleBrandFeatured = async (
  id: string,
  isFeatured: boolean
): Promise<Brand> => {
  const response = await axiosSeller.patch<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/${id}/featured`,
    {
      isFeatured,
    }
  );
  return response.data.data;
};

// Toggle verified status (admin only)
export const toggleBrandVerified = async (
  id: string,
  isVerified: boolean
): Promise<Brand> => {
  const response = await axiosSeller.patch<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/${id}/verified`,
    {
      isVerified,
    }
  );
  return response.data.data;
};

// Update brand sort order
export const updateBrandSortOrder = async (
  id: string,
  sortOrder: number
): Promise<Brand> => {
  const response = await axiosSeller.patch<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/${id}/sort-order`,
    {
      sortOrder,
    }
  );
  return response.data.data;
};

// Search brands
export const searchBrands = async (searchTerm: string): Promise<Brand[]> => {
  const response = await axiosSeller.get<ApiResponse<Brand[]>>(
    `${API_ENDPOINTS.BRANDS}/search?q=${encodeURIComponent(searchTerm)}`
  );
  return response.data.data;
};

// Upload brand logo
export const uploadBrandLogo = async (
  brandId: string,
  logoFile: File
): Promise<{ logoUrl: string }> => {
  const formData = new FormData();
  formData.append("logo", logoFile);

  const endpoint = API_ENDPOINTS.UPLOAD.uploadBrandLogo(brandId);
  const response = await axiosSeller.post<ApiResponse<{ logoUrl: string }>>(
    endpoint.url,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

// Upload brand banner
export const uploadBrandBanner = async (
  brandId: string,
  bannerFile: File
): Promise<{ bannerUrl: string }> => {
  const formData = new FormData();
  formData.append("banner", bannerFile);

  const endpoint = API_ENDPOINTS.UPLOAD.uploadBrandBanner(brandId);
  const response = await axiosSeller.post<ApiResponse<{ bannerUrl: string }>>(
    endpoint.url,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

// Upload brand images (gallery)
export const uploadBrandImages = async (
  brandId: string,
  imageFiles: File[]
): Promise<{ imageUrls: string[] }> => {
  const formData = new FormData();
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  const endpoint = API_ENDPOINTS.UPLOAD.uploadBrandImages(brandId);
  const response = await axiosSeller.post<ApiResponse<{ imageUrls: string[] }>>(
    endpoint.url,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

// Get brand products
export const getBrandProducts = async (
  brandId: string,
  params?: {
    page?: number;
    limit?: number;
    category?: string;
  }
): Promise<PaginatedResponse<any>> => {
  const queryString = params ? buildQueryParams(params) : "";
  const url = `${API_ENDPOINTS.BRANDS}/${brandId}/products${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axiosSeller.get<PaginatedResponse<any>>(url);
  return response.data;
};

// Get brand top products
export const getBrandTopProducts = async (
  brandId: string,
  limit?: number
): Promise<any[]> => {
  const url = `${API_ENDPOINTS.BRANDS}/${brandId}/top-products${
    limit ? `?limit=${limit}` : ""
  }`;
  const response = await axiosSeller.get<ApiResponse<any[]>>(url);
  return response.data.data;
};

// Get brand statistics
export const getBrandStatistics = async (): Promise<{
  totalBrands: number;
  activeBrands: number;
  featuredBrands: number;
  verifiedBrands: number;
  brandsWithProducts: number;
}> => {
  const response = await axiosSeller.get<ApiResponse<any>>(
    `${API_ENDPOINTS.BRANDS}/statistics`
  );
  return response.data.data;
};

// Follow/Unfollow brand (for customers)
export const toggleBrandFollow = async (
  brandId: string,
  follow: boolean
): Promise<{ followerCount: number }> => {
  const response = await axiosSeller.post<
    ApiResponse<{ followerCount: number }>
  >(`${API_ENDPOINTS.BRANDS}/${brandId}/${follow ? "follow" : "unfollow"}`);
  return response.data.data;
};

// Get brand followers
export const getBrandFollowers = async (
  brandId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<PaginatedResponse<any>> => {
  const queryString = params ? buildQueryParams(params) : "";
  const url = `${API_ENDPOINTS.BRANDS}/${brandId}/followers${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await axiosSeller.get<PaginatedResponse<any>>(url);
  return response.data;
};

// Update brand categories
export const updateBrandCategories = async (
  brandId: string,
  categoryIds: string[]
): Promise<Brand> => {
  const response = await axiosSeller.patch<ApiResponse<Brand>>(
    `${API_ENDPOINTS.BRANDS}/${brandId}/categories`,
    {
      categories: categoryIds,
    }
  );
  return response.data.data;
};

export default {
  getBrands,
  getActiveBrands,
  getFeaturedBrands,
  getVerifiedBrands,
  getPopularBrands,
  getBrandsByCategory,
  getBrandsByAlphabet,
  getBrand,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkDeleteBrands,
  updateBrandStatus,
  toggleBrandFeatured,
  toggleBrandVerified,
  updateBrandSortOrder,
  searchBrands,
  uploadBrandLogo,
  uploadBrandBanner,
  uploadBrandImages,
  getBrandProducts,
  getBrandTopProducts,
  getBrandStatistics,
  toggleBrandFollow,
  getBrandFollowers,
  updateBrandCategories,
};
