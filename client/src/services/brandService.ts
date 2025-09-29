import axiosSeller from "@/lib/api/axiosSeller";
import { API_ENDPOINTS } from "../constants/endpoints";
import { Brand, ApiResponse } from "../types/global";

export interface BrandFormData {
  name: string;
  description?: string;
  shortDescription?: string;
  logo?: string;
  banner?: string;
  website?: string;
  companyInfo?: {
    foundedYear?: number;
    headquarters?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  sortOrder?: number;
  categories?: string[];
  tags?: string[];
  commission?: number;
  guidelines?: {
    logoUsage?: string;
    colorPalette?: string[];
    typography?: string;
    toneOfVoice?: string;
  };
}

export interface BrandFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
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

// Get all brands
export const getBrands = async (
  filters: BrandFilters = {}
): Promise<ApiResponse<{ brands: Brand[]; pagination: any }>> => {
  const api = axiosSeller;
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.BRANDS.BASE}${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Get single brand by ID
export const getBrand = async (id: string): Promise<ApiResponse<Brand>> => {
  const api = axiosSeller;
  const response = await api.get(API_ENDPOINTS.BRANDS.GET_BY_ID(id));
  return response.data;
};

// Get featured brands
export const getFeaturedBrands = async (): Promise<ApiResponse<Brand[]>> => {
  const api = axiosSeller;
  const response = await api.get(API_ENDPOINTS.BRANDS.GET_FEATURED);
  return response.data;
};

// Get verified brands
export const getVerifiedBrands = async (): Promise<ApiResponse<Brand[]>> => {
  const api = axiosSeller;
  const response = await api.get(API_ENDPOINTS.BRANDS.GET_VERIFIED);
  return response.data;
};

// Get brands by alphabet
export const getBrandsByAlphabet = async (): Promise<ApiResponse<any[]>> => {
  const api = axiosSeller;
  const response = await api.get(API_ENDPOINTS.BRANDS.GET_BY_ALPHABET);
  return response.data;
};

// Create new brand
export const createBrand = async (
  brandData: BrandFormData
): Promise<ApiResponse<Brand>> => {
  const api = axiosSeller;
  const response = await api.post(API_ENDPOINTS.BRANDS.CREATE, brandData);
  return response.data;
};

// Update brand
export const updateBrand = async (
  id: string,
  brandData: Partial<BrandFormData>
): Promise<ApiResponse<Brand>> => {
  const api = axiosSeller;
  const response = await api.put(API_ENDPOINTS.BRANDS.UPDATE(id), brandData);
  return response.data;
};

// Delete brand
export const deleteBrand = async (id: string): Promise<ApiResponse<void>> => {
  const api = axiosSeller;
  const response = await api.delete(API_ENDPOINTS.BRANDS.DELETE(id));
  return response.data;
};

// Bulk delete brands
export const bulkDeleteBrands = async (
  brandIds: string[]
): Promise<ApiResponse<void>> => {
  const api = axiosSeller;
  const response = await api.post(API_ENDPOINTS.BRANDS.BULK_DELETE, {
    brandIds,
  });
  return response.data;
};

// Bulk update brands
export const bulkUpdateBrands = async (
  brandIds: string[],
  updateData: Partial<BrandFormData>
): Promise<ApiResponse<void>> => {
  const api = axiosSeller;
  const response = await api.post(API_ENDPOINTS.BRANDS.BULK_UPDATE, {
    brandIds,
    updateData,
  });
  return response.data;
};

// Search brands
export const searchBrands = async (
  query: string,
  filters: BrandFilters = {}
): Promise<ApiResponse<{ brands: Brand[]; pagination: any }>> => {
  const api = axiosSeller;
  const queryString = buildQueryParams({ ...filters, q: query });
  const url = `${API_ENDPOINTS.BRANDS.SEARCH}?${queryString}`;
  const response = await api.get(url);
  return response.data;
};

// Upload brand logo
export const uploadBrandLogo = async (
  id: string,
  file: File
): Promise<ApiResponse<{ url: string }>> => {
  const api = axiosSeller;
  const formData = new FormData();
  formData.append("logo", file);

  const response = await api.post(
    API_ENDPOINTS.BRANDS.UPLOAD_LOGO(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Upload brand banner
export const uploadBrandBanner = async (
  id: string,
  file: File
): Promise<ApiResponse<{ url: string }>> => {
  const api = axiosSeller;
  const formData = new FormData();
  formData.append("banner", file);

  const response = await api.post(
    API_ENDPOINTS.BRANDS.UPLOAD_BANNER(id),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Get brand products
export const getBrandProducts = async (
  id: string,
  filters: any = {}
): Promise<ApiResponse<any>> => {
  const api = axiosSeller;
  const queryString = buildQueryParams(filters);
  const url = `${API_ENDPOINTS.BRANDS.GET_BY_ID(id)}/products${
    queryString ? `?${queryString}` : ""
  }`;
  const response = await api.get(url);
  return response.data;
};

// Export all functions as default object for backward compatibility
const brandService = {
  getBrands,
  getBrand,
  getFeaturedBrands,
  getVerifiedBrands,
  getBrandsByAlphabet,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkDeleteBrands,
  bulkUpdateBrands,
  searchBrands,
  uploadBrandLogo,
  uploadBrandBanner,
  getBrandProducts,
};

export default brandService;
