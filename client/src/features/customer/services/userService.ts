// client/src/features/customer/services/cartService.ts

import axiosCustomer from "@/lib/api/axiosCustomer";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";
import {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
  UserProfile,
  UpdateProfilePayload,
} from "../account/types";

export const userService = {
  // Get user's addresses
  getAddresses: async (): Promise<ApiResponse<Address>> => {
    try {
      const endpoint = API_ENDPOINTS.USER.getAddresses();
      const response = await axiosCustomer.get(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch addresses"
      );
    }
  },

  // Add item to cart
  addAddress: async (
    payload: CreateAddressPayload
  ): Promise<ApiResponse<Address>> => {
    try {
      const endpoint = API_ENDPOINTS.USER.addAddress();
      const response = await axiosCustomer.post(endpoint.url, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add");
    }
  },

  updateAddress: async (
    payload: UpdateAddressPayload,
    id: string
  ): Promise<ApiResponse<Address>> => {
    try {
      const endpoint = API_ENDPOINTS.USER.updateAddress(id);
      const response = await axiosCustomer.put(endpoint.url, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add");
    }
  },

  deleteAddress: async (id: string): Promise<ApiResponse<Address>> => {
    try {
      const endpoint = API_ENDPOINTS.USER.deleteAddress(id);
      const response = await axiosCustomer.delete(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete");
    }
  },

  // ==================== PROFILE OPERATIONS ====================

  // Get user profile
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const endpoint = API_ENDPOINTS.USER.getProfile();
      const response = await axiosCustomer.get(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  },

  // Update user profile
  updateProfile: async (
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<UserProfile>> => {
    try {
      const endpoint = API_ENDPOINTS.USER.updateProfile();
      const response = await axiosCustomer.put(endpoint.url, payload);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<ApiResponse<UserProfile>> => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const endpoint = API_ENDPOINTS.USER.uploadAvatar();
      const response = await axiosCustomer.post(endpoint.url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to upload avatar"
      );
    }
  },

  // Delete account
  deleteAccount: async (): Promise<ApiResponse<null>> => {
    try {
      const endpoint = API_ENDPOINTS.USER.deleteAccount();
      const response = await axiosCustomer.delete(endpoint.url);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete account"
      );
    }
  },
};

export default userService;
