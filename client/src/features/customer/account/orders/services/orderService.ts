import axiosCustomer from "@/lib/api/axiosCustomer";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";

export const orderService = {
  // Get user's orders with pagination
  getMyOrders: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<ApiResponse<any>> => {
    try {
      const endpoint = API_ENDPOINTS.ORDERS.getMyOrders();
      const queryParts: string[] = [];
      if (params.page) queryParts.push(`page=${params.page}`);
      if (params.limit) queryParts.push(`limit=${params.limit}`);
      if (params.status && params.status !== "all")
        queryParts.push(`status=${params.status}`);
      const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
      const response = await axiosCustomer.get(`${endpoint.url}${query}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  },

  // Get single order details
  getOrder: async (orderId: string): Promise<ApiResponse<any>> => {
    try {
      const endpoint = API_ENDPOINTS.ORDERS.getOrder(orderId);
      const response = await axiosCustomer.get(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  },

  // Cancel an order
  cancelOrder: async (
    orderId: string,
    reason: string
  ): Promise<ApiResponse<any>> => {
    try {
      const endpoint = API_ENDPOINTS.ORDERS.cancelOrder(orderId);
      const response = await axiosCustomer.patch(endpoint.url, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  },

  // Request return
  requestReturn: async (
    orderId: string,
    reason: string
  ): Promise<ApiResponse<any>> => {
    try {
      const endpoint = API_ENDPOINTS.ORDERS.requestReturn(orderId);
      const response = await axiosCustomer.post(endpoint.url, { reason });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to request return"
      );
    }
  },
  // Download invoice PDF
  downloadInvoice: async (orderId: string): Promise<void> => {
    try {
      const endpoint = API_ENDPOINTS.ORDERS.downloadInvoice(orderId);
      const response = await axiosCustomer.get(endpoint.url, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to download invoice"
      );
    }
  },
};

export default orderService;
