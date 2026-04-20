import axiosSeller from "@/lib/api/axiosSeller";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";

export interface SellerOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const sellerOrderService = {
  // Get seller's orders
  getMyOrders: async (
    filters: SellerOrderFilters = {}
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_ORDERS.getMyOrders();
    const params = new URLSearchParams();
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosSeller.get(`${endpoint.url}${query}`);
    return response.data;
  },

  // Get single order details
  getOrder: async (orderId: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_ORDERS.getOrder(orderId);
    const response = await axiosSeller.get(endpoint.url);
    return response.data;
  },

  // Update order status
  updateStatus: async (
    orderId: string,
    status: string,
    note?: string
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_ORDERS.updateStatus(orderId);
    const response = await axiosSeller.patch(endpoint.url, { status, note });
    return response.data;
  },

  // Update tracking info
  updateTracking: async (
    orderId: string,
    trackingData: {
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: string;
    }
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_ORDERS.updateTracking(orderId);
    const response = await axiosSeller.patch(endpoint.url, trackingData);
    return response.data;
  },

  // Process return request (approve/reject)
  processReturn: async (
    orderId: string,
    action: "approve" | "reject",
    note?: string
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_ORDERS.processReturn(orderId);
    const response = await axiosSeller.patch(endpoint.url, { action, note });
    return response.data;
  },

  // Get order stats
  getStats: async (params: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  } = {}): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_ORDERS.getStats();
    const query = new URLSearchParams();
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.groupBy) query.append("groupBy", params.groupBy);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const response = await axiosSeller.get(`${endpoint.url}${qs}`);
    return response.data;
  },
};

export default sellerOrderService;
