// client/src/features/customer/services/cartService.ts

import axiosCustomer from "@/lib/api/axiosCustomer";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";
import {
  Cart,
  AddToCartPayload,
  UpdateCartItemPayload,
  ApplyPromoCodePayload,
} from "../cart/types";

export const cartService = {
  // Get user's cart
  getCart: async (): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.getCart();
      const response = await axiosCustomer.get(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch cart");
    }
  },

  // Add item to cart
  addToCart: async (payload: AddToCartPayload): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.addToCart();
      const response = await axiosCustomer.post(endpoint.url, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to add item to cart"
      );
    }
  },

  // Update cart item quantity
  updateCartItem: async (
    payload: UpdateCartItemPayload
  ): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.updateCartItem(payload?.productId);
      const response = await axiosCustomer.put(endpoint.url, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update cart item"
      );
    }
  },

  // Remove item from cart
  removeFromCart: async (productId: string): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.removeFromCart(productId);
      const response = await axiosCustomer.delete(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to remove item from cart"
      );
    }
  },

  // Clear entire cart
  clearCart: async (): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.clearCart();
      const response = await axiosCustomer.delete(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to clear cart");
    }
  },

  // Apply promo code
  applyPromoCode: async (
    payload: ApplyPromoCodePayload
  ): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.applyPromoCode();
      const response = await axiosCustomer.post(endpoint.url, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to apply promo code"
      );
    }
  },

  // Remove promo code
  removePromoCode: async (): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.removePromoCode();
      const response = await axiosCustomer.delete(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to remove promo code"
      );
    }
  },

  // Sync local cart with server (after login)
  syncCart: async (localCartItems: any[]): Promise<ApiResponse<Cart>> => {
    try {
      const endpoint = API_ENDPOINTS.CART.syncCart();
      const response = await axiosCustomer.post(endpoint.url, {
        items: localCartItems,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to sync cart");
    }
  },
};

export default cartService;
