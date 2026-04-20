import axiosSeller from "@/lib/api/axiosSeller";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";

export interface CustomerListFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "lastOrderDate" | "totalSpent" | "totalOrders" | "name";
  sortOrder?: "asc" | "desc";
}

const sellerCustomerService = {
  getCustomers: async (
    filters: CustomerListFilters = {}
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_CUSTOMERS.getCustomers();
    const params = new URLSearchParams();
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosSeller.get(`${endpoint.url}${query}`);
    return response.data;
  },

  getCustomer: async (customerId: string, page = 1): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.SELLER_CUSTOMERS.getCustomer(customerId);
    const query = page > 1 ? `?page=${page}` : "";
    const response = await axiosSeller.get(`${endpoint.url}${query}`);
    return response.data;
  },
};

export default sellerCustomerService;
