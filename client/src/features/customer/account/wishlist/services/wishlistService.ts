import axiosCustomer from "@/lib/api/axiosCustomer";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";

const wishlistService = {
  getWishlist: async (): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.USER.getWishlist();
    const response = await axiosCustomer.get(endpoint.url);
    return response.data;
  },

  addToWishlist: async (productId: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.USER.addToWishlist();
    const response = await axiosCustomer.post(endpoint.url, { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.USER.removeFromWishlist(productId);
    const response = await axiosCustomer.delete(endpoint.url);
    return response.data;
  },

  clearWishlist: async (): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.USER.clearWishlist();
    const response = await axiosCustomer.delete(endpoint.url);
    return response.data;
  },
};

export default wishlistService;
