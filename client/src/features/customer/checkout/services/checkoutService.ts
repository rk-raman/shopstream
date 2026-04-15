import axiosCustomer from "@/lib/api/axiosCustomer";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";
import {
  CheckoutSession,
  OrderConfirmation,
} from "../types";

export const checkoutService = {
  // Create or resume checkout session from cart
  createSession: async (): Promise<ApiResponse<{ session: CheckoutSession }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.createSession();
      const response = await axiosCustomer.post(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create checkout session"
      );
    }
  },

  // Get session state
  getSession: async (
    sessionId: string
  ): Promise<ApiResponse<{ session: CheckoutSession }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.getSession(sessionId);
      const response = await axiosCustomer.get(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get checkout session"
      );
    }
  },

  // Set delivery address
  setAddress: async (
    sessionId: string,
    addressData: { addressId?: string; [key: string]: any }
  ): Promise<ApiResponse<{ session: CheckoutSession }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.setAddress(sessionId);
      const response = await axiosCustomer.put(endpoint.url, addressData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to set address"
      );
    }
  },

  // Get order summary
  getSummary: async (
    sessionId: string
  ): Promise<ApiResponse<{ summary: any }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.getSummary(sessionId);
      const response = await axiosCustomer.get(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get summary"
      );
    }
  },

  // Apply coupon
  applyCoupon: async (
    sessionId: string,
    code: string
  ): Promise<ApiResponse<{ session: CheckoutSession }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.applyCoupon(sessionId);
      const response = await axiosCustomer.post(endpoint.url, { code });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to apply coupon"
      );
    }
  },

  // Remove coupon
  removeCoupon: async (
    sessionId: string
  ): Promise<ApiResponse<{ session: CheckoutSession }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.removeCoupon(sessionId);
      const response = await axiosCustomer.delete(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to remove coupon"
      );
    }
  },

  // Initiate payment
  initiatePayment: async (
    sessionId: string,
    paymentMethod: string
  ): Promise<
    ApiResponse<{
      session: CheckoutSession;
      paymentIntent: any;
      requiresAction: boolean;
    }>
  > => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.initiatePayment(sessionId);
      const response = await axiosCustomer.post(endpoint.url, {
        paymentMethod,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to initiate payment"
      );
    }
  },

  // Confirm payment and place order
  confirmPayment: async (
    sessionId: string,
    paymentData: { transactionId?: string } = {}
  ): Promise<ApiResponse<{ order: any; session: CheckoutSession }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.confirmPayment(sessionId);
      const response = await axiosCustomer.post(endpoint.url, paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to confirm payment"
      );
    }
  },

  // Place COD order
  placeCODOrder: async (
    sessionId: string
  ): Promise<ApiResponse<{ order: any; session: CheckoutSession }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.placeCODOrder(sessionId);
      const response = await axiosCustomer.post(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to place COD order"
      );
    }
  },

  // Get order confirmation
  getConfirmation: async (
    sessionId: string
  ): Promise<ApiResponse<{ confirmation: OrderConfirmation }>> => {
    try {
      const endpoint = API_ENDPOINTS.CHECKOUT.getConfirmation(sessionId);
      const response = await axiosCustomer.get(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get confirmation"
      );
    }
  },
};

export default checkoutService;
