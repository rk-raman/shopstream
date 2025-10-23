// client/src/features/customer/services/cartService.ts

import axiosCustomer from "@/lib/api/axiosCustomer";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiResponse } from "@/types/global";
import {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
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
};

export default userService;
