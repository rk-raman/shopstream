import axiosCustomer from "@/lib/api/axiosCustomer";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";

const reviewService = {
  getProductReviews: async (
    productId: string,
    params: { page?: number; limit?: number; sortBy?: string; sortOrder?: string; rating?: number } = {}
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.REVIEWS.getProductReviews(productId);
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.limit) query.append("limit", String(params.limit));
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.sortOrder) query.append("sortOrder", params.sortOrder);
    if (params.rating) query.append("rating", String(params.rating));
    const qs = query.toString() ? `?${query.toString()}` : "";
    const response = await axiosCustomer.get(`${endpoint.url}${qs}`);
    return response.data;
  },

  addReview: async (
    productId: string,
    data: { rating: number; title?: string; comment?: string }
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.REVIEWS.addReview(productId);
    const response = await axiosCustomer.post(endpoint.url, data);
    return response.data;
  },

  updateReview: async (
    reviewId: string,
    data: { rating?: number; title?: string; comment?: string }
  ): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.REVIEWS.updateReview(reviewId);
    const response = await axiosCustomer.put(endpoint.url, data);
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.REVIEWS.deleteReview(reviewId);
    const response = await axiosCustomer.delete(endpoint.url);
    return response.data;
  },

  markHelpful: async (reviewId: string): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.REVIEWS.markHelpful(reviewId);
    const response = await axiosCustomer.post(endpoint.url);
    return response.data;
  },

  getMyReviews: async (page = 1): Promise<ApiResponse<any>> => {
    const endpoint = API_ENDPOINTS.REVIEWS.getMyReviews();
    const query = page > 1 ? `?page=${page}` : "";
    const response = await axiosCustomer.get(`${endpoint.url}${query}`);
    return response.data;
  },
};

export default reviewService;
