import { API_ENDPOINTS } from "@/lib/api/endpoints";
import apiCustomer from "@/lib/api/axiosCustomer";
import apiSeller from "@/lib/api/axiosSeller";
import { ApiResponse, User, LoginForm, RegisterForm } from "@/types/global";
import { AxiosResponse } from "axios";

const { AUTH } = API_ENDPOINTS;

// Auth response interfaces
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface LoginResponse extends ApiResponse<AuthResponse> {}
interface RegisterResponse extends ApiResponse<AuthResponse> {}

// Customer Auth Service
export class CustomerAuthService {
  static async register(payload: RegisterForm): Promise<RegisterResponse> {
    try {
      const { url, method } = AUTH.customerRegister();
      const response: AxiosResponse<RegisterResponse> = await apiCustomer({
        url,
        method,
        data: payload,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async login(payload: LoginForm): Promise<LoginResponse> {
    try {
      const { url, method } = AUTH.customerLogin();
      const response: AxiosResponse<LoginResponse> = await apiCustomer({
        url,
        method,
        data: payload,
      });

      // Store token in localStorage
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("customerToken", response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem(
            "customerRefreshToken",
            response.data.data.refreshToken
          );
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.customerLogout();
      const response: AxiosResponse<ApiResponse> = await apiCustomer({
        url,
        method,
      });

      // Clear tokens from localStorage
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerRefreshToken");

      return response.data;
    } catch (error) {
      // Clear tokens even if logout fails
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerRefreshToken");
      throw error;
    }
  }

  static async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = localStorage.getItem("customerRefreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const { url, method } = AUTH.refreshToken();
      const response: AxiosResponse<LoginResponse> = await apiCustomer({
        url,
        method,
        data: { refreshToken },
      });

      // Update tokens
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("customerToken", response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem(
            "customerRefreshToken",
            response.data.data.refreshToken
          );
        }
      }

      return response.data;
    } catch (error) {
      // Clear tokens if refresh fails
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerRefreshToken");
      throw error;
    }
  }

  static async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.forgotPassword();
      const response: AxiosResponse<ApiResponse> = await apiCustomer({
        url,
        method,
        data: { email },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.resetPassword();
      const response: AxiosResponse<ApiResponse> = await apiCustomer({
        url,
        method,
        data: { token, password },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.verifyEmail();
      const response: AxiosResponse<ApiResponse> = await apiCustomer({
        url,
        method,
        data: { token },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem("customerToken");
  }

  static getToken(): string | null {
    return localStorage.getItem("customerToken");
  }
}

// Seller Auth Service
export class SellerAuthService {
  static async register(payload: RegisterForm): Promise<RegisterResponse> {
    try {
      const { url, method } = AUTH.sellerRegister();
      const response: AxiosResponse<RegisterResponse> = await apiSeller({
        url,
        method,
        data: payload,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async login(payload: LoginForm): Promise<LoginResponse> {
    try {
      const { url, method } = AUTH.sellerLogin();
      const response: AxiosResponse<LoginResponse> = await apiSeller({
        url,
        method,
        data: payload,
      });

      // Store token in localStorage
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("sellerToken", response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem(
            "sellerRefreshToken",
            response.data.data.refreshToken
          );
        }
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.sellerLogout();
      const response: AxiosResponse<ApiResponse> = await apiSeller({
        url,
        method,
      });

      // Clear tokens from localStorage
      localStorage.removeItem("sellerToken");
      localStorage.removeItem("sellerRefreshToken");

      return response.data;
    } catch (error) {
      // Clear tokens even if logout fails
      localStorage.removeItem("sellerToken");
      localStorage.removeItem("sellerRefreshToken");
      throw error;
    }
  }

  static async refreshToken(): Promise<LoginResponse> {
    try {
      const refreshToken = localStorage.getItem("sellerRefreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const { url, method } = AUTH.refreshToken();
      const response: AxiosResponse<LoginResponse> = await apiSeller({
        url,
        method,
        data: { refreshToken },
      });

      // Update tokens
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem("sellerToken", response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem(
            "sellerRefreshToken",
            response.data.data.refreshToken
          );
        }
      }

      return response.data;
    } catch (error) {
      // Clear tokens if refresh fails
      localStorage.removeItem("sellerToken");
      localStorage.removeItem("sellerRefreshToken");
      throw error;
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem("sellerToken");
  }

  static getToken(): string | null {
    return localStorage.getItem("sellerToken");
  }
}

// Legacy exports for backward compatibility
export const register = CustomerAuthService.register;
export const login = CustomerAuthService.login;
export const logout = CustomerAuthService.logout;
