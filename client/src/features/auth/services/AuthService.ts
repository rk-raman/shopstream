import { API_ENDPOINTS } from "@/lib/api/endpoints";
import apiCustomer from "@/lib/api/axiosCustomer";
import { ApiResponse, User, LoginForm, RegisterForm } from "@/types/global";
import { AxiosResponse } from "axios";

const { AUTH } = API_ENDPOINTS;

// Auth response interfaces
interface AuthResponse {
  user: User;
  accessToken: string; // Match server response
  refreshToken?: string;
}

interface LoginResponse extends ApiResponse<AuthResponse> {}
interface RegisterResponse extends ApiResponse<AuthResponse> {}

// Unified Auth Service for all user types
export class AuthService {
  // Registration with role specification
  static async register(
    payload: RegisterForm & { role: "customer" | "seller" }
  ): Promise<RegisterResponse> {
    try {
      const { url, method } = AUTH.register();
      const response: AxiosResponse<RegisterResponse> = await apiCustomer({
        url,
        method,
        data: payload,
      });

      // Store tokens based on user role
      if (response.data.success && response.data.data?.accessToken) {
        const { user, accessToken, refreshToken } = response.data.data;
        this.storeTokens(user.role, accessToken, refreshToken);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Unified login
  static async login(payload: LoginForm): Promise<LoginResponse> {
    try {
      const { url, method } = AUTH.login();
      const response: AxiosResponse<LoginResponse> = await apiCustomer({
        url,
        method,
        data: payload,
      });

      // Store tokens based on user role
      if (response.data.success && response.data.data?.accessToken) {
        const { user, accessToken, refreshToken } = response.data.data;
        this.storeTokens(user.role, accessToken, refreshToken);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Unified logout
  static async logout(userRole?: "customer" | "seller"): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.logout();
      const response: AxiosResponse<ApiResponse> = await apiCustomer({
        url,
        method,
      });

      // Clear all tokens
      this.clearAllTokens();
      return response.data;
    } catch (error) {
      this.clearAllTokens();
      throw error;
    }
  }

  // Token refresh
  static async refreshToken(
    userRole: "customer" | "seller"
  ): Promise<LoginResponse> {
    try {
      const refreshToken = this.getRefreshToken(userRole);
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
      if (response.data.success && response.data.data?.accessToken) {
        const {
          user,
          accessToken,
          refreshToken: newRefreshToken,
        } = response.data.data;
        this.storeTokens(user.role, accessToken, newRefreshToken);
      }

      return response.data;
    } catch (error) {
      this.clearTokens(userRole);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      const { url, method } = AUTH.me();
      const response: AxiosResponse<ApiResponse<{ user: User }>> =
        await apiCustomer({
          url,
          method,
        });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Password management
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
    newPassword: string
  ): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.resetPassword();
      const response: AxiosResponse<ApiResponse> = await apiCustomer({
        url,
        method,
        data: { token, newPassword },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const { url, method } = AUTH.verifyEmail(token);
      const response: AxiosResponse<ApiResponse> = await apiCustomer({
        url,
        method,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Utility methods
  private static storeTokens(
    role: string,
    accessToken: string,
    refreshToken?: string
  ): void {
    const prefix = role === "seller" ? "seller" : "customer";
    localStorage.setItem(`${prefix}Token`, accessToken);
    if (refreshToken) {
      localStorage.setItem(`${prefix}RefreshToken`, refreshToken);
    }
  }

  private static clearTokens(role: "customer" | "seller"): void {
    const prefix = role === "seller" ? "seller" : "customer";
    localStorage.removeItem(`${prefix}Token`);
    localStorage.removeItem(`${prefix}RefreshToken`);
  }

  private static clearAllTokens(): void {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerRefreshToken");
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerRefreshToken");
  }

  static getToken(role: "customer" | "seller"): string | null {
    const prefix = role === "seller" ? "seller" : "customer";
    return localStorage.getItem(`${prefix}Token`);
  }

  private static getRefreshToken(role: "customer" | "seller"): string | null {
    const prefix = role === "seller" ? "seller" : "customer";
    return localStorage.getItem(`${prefix}RefreshToken`);
  }

  static isAuthenticated(role: "customer" | "seller"): boolean {
    return !!this.getToken(role);
  }

  // Check if any user is authenticated
  static isAnyUserAuthenticated(): boolean {
    return this.isAuthenticated("customer") || this.isAuthenticated("seller");
  }

  // Get current user role from stored token
  static getCurrentUserRole(): "customer" | "seller" | null {
    if (this.isAuthenticated("customer")) return "customer";
    if (this.isAuthenticated("seller")) return "seller";
    return null;
  }
}

// Legacy exports for backward compatibility
export const register = AuthService.register;
export const login = AuthService.login;
export const logout = AuthService.logout;
