import axiosSeller from "@/lib/api/axiosSeller";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";

export interface CouponFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "expired" | "scheduled" | "inactive" | "all";
  type?: "percentage" | "flat";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CouponFormData {
  code: string;
  description?: string;
  type: "percentage" | "flat";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive?: boolean;
}

const sellerCouponService = {
  getAll: async (filters: CouponFilters = {}): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.getAll();
    const params = new URLSearchParams();
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all") params.append("status", filters.status);
    if (filters.type) params.append("type", filters.type);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosSeller.get(`${endpoint.url}${query}`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.getById(id);
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  },

  create: async (data: CouponFormData): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.create();
    const response = await axiosSeller.post(endpoint.url, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CouponFormData>): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.update(id);
    const response = await axiosSeller.put(endpoint.url, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.delete(id);
    const response = await axiosSeller.delete(endpoint.url);
    return response.data;
  },

  toggle: async (id: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.toggle(id);
    const response = await axiosSeller.patch(endpoint.url);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.getStats();
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  },

  getUsage: async (id: string, page = 1): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.COUPONS.getUsage(id);
    const query = page > 1 ? `?page=${page}` : "";
    const response = await axiosSeller.get(`${endpoint.url}${query}`);
    return response.data;
  },
};

export default sellerCouponService;
