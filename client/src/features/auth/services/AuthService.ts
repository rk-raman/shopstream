import { API_ENDPOINTS } from "@/lib/api/endpoints";
import apiCustomer from "@/lib/api/axiosCustomer";
import apiSeller from "@/lib/api/axiosSeller";
import { ApiResponse, User, LoginForm, RegisterForm } from "@/types/global";
import { AxiosResponse } from "axios";
import { AUTH_CONFIG } from "@/constants/constants";
import { localStorageUtils } from "@/lib/utils/storage";

const { AUTH } = API_ENDPOINTS;

// Auth response interfaces
interface AuthResponse {
  user: User;
  accessToken: string; // Match server response
  refreshToken?: string;
}

interface LoginResponse extends ApiResponse<AuthResponse> {}
interface RegisterResponse extends ApiResponse<AuthResponse> {}

// Token management utilities
const storeTokens = (
  role: "customer" | "seller",
  accessToken: string,
  refreshToken?: string
): void => {
  const tokenKey =
    role === "seller"
      ? AUTH_CONFIG.SELLER_TOKEN_KEY
      : AUTH_CONFIG.CUSTOMER_TOKEN_KEY;
  const refreshKey = `${tokenKey.replace("Token", "RefreshToken")}`;

  localStorageUtils.set(tokenKey, accessToken);
  if (refreshToken) {
    localStorageUtils.set(refreshKey, refreshToken);
  }
};

const clearTokens = (role: "customer" | "seller"): void => {
  const tokenKey =
    role === "seller"
      ? AUTH_CONFIG.SELLER_TOKEN_KEY
      : AUTH_CONFIG.CUSTOMER_TOKEN_KEY;
  const refreshKey = `${tokenKey.replace("Token", "RefreshToken")}`;

  localStorageUtils.remove(tokenKey);
  localStorageUtils.remove(refreshKey);
};

export const clearAllTokens = (): void => {
  localStorageUtils.remove(AUTH_CONFIG.CUSTOMER_TOKEN_KEY);
  localStorageUtils.remove(AUTH_CONFIG.SELLER_TOKEN_KEY);
  localStorageUtils.remove(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  // Also clear role-specific refresh tokens
  localStorageUtils.remove("customerRefreshToken");
  localStorageUtils.remove("sellerRefreshToken");
};

const getToken = (role: "customer" | "seller"): string | null => {
  const tokenKey =
    role === "seller"
      ? AUTH_CONFIG.SELLER_TOKEN_KEY
      : AUTH_CONFIG.CUSTOMER_TOKEN_KEY;
  return localStorageUtils.get<string>(tokenKey);
};

const getRefreshToken = (role: "customer" | "seller"): string | null => {
  const tokenKey =
    role === "seller"
      ? AUTH_CONFIG.SELLER_TOKEN_KEY
      : AUTH_CONFIG.CUSTOMER_TOKEN_KEY;
  const refreshKey = `${tokenKey.replace("Token", "RefreshToken")}`;
  return localStorageUtils.get<string>(refreshKey);
};

// Authentication functions
export const register = async (
  payload: RegisterForm & { role: "customer" | "seller" }
): Promise<RegisterResponse> => {
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
      storeTokens(user.role, accessToken, refreshToken);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (payload: LoginForm): Promise<LoginResponse> => {
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
      storeTokens(user.role, accessToken, refreshToken);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async (
  userRole?: "customer" | "seller"
): Promise<ApiResponse> => {
  try {
    const { url, method } = AUTH.logout();
    const response: AxiosResponse<ApiResponse> = await apiCustomer({
      url,
      method,
    });

    // Clear all tokens
    clearAllTokens();
    return response.data;
  } catch (error) {
    clearAllTokens();
    throw error;
  }
};

export const refreshToken = async (
  userRole: "customer" | "seller"
): Promise<LoginResponse> => {
  try {
    const refreshTokenValue = getRefreshToken(userRole);
    if (!refreshTokenValue) {
      throw new Error("No refresh token available");
    }

    const { url, method } = AUTH.refreshToken();
    const response: AxiosResponse<LoginResponse> = await apiCustomer({
      url,
      method,
      data: { refreshToken: refreshTokenValue },
    });

    // Update tokens
    if (response.data.success && response.data.data?.accessToken) {
      const {
        user,
        accessToken,
        refreshToken: newRefreshToken,
      } = response.data.data;
      storeTokens(user.role, accessToken, newRefreshToken);
    }

    return response.data;
  } catch (error) {
    clearTokens(userRole);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<
  ApiResponse<{ user: User }>
> => {
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
};

export const getSellerCurrentUser = async (): Promise<
  ApiResponse<{ user: User }>
> => {
  try {
    const { url, method } = AUTH.me();
    const response: AxiosResponse<ApiResponse<{ user: User }>> =
      await apiSeller({
        url,
        method,
      });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string): Promise<ApiResponse> => {
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
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<ApiResponse> => {
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
};

export const verifyEmail = async (token: string): Promise<ApiResponse> => {
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
};

// Authentication state functions
export const isAuthenticated = (role: "customer" | "seller"): boolean => {
  return !!getToken(role);
};

export const isAnyUserAuthenticated = (): boolean => {
  return isAuthenticated("customer") || isAuthenticated("seller");
};

export const getCurrentUserRole = (): "customer" | "seller" | null => {
  if (isAuthenticated("customer")) return "customer";
  if (isAuthenticated("seller")) return "seller";
  return null;
};

export const getUserToken = (role: "customer" | "seller"): string | null => {
  return getToken(role);
};

// AuthService object for backward compatibility (optional)
export const AuthService = {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  isAuthenticated,
  isAnyUserAuthenticated,
  getCurrentUserRole,
  getToken: getUserToken,
};
