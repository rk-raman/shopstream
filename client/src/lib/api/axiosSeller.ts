import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { API_CONFIG, AUTH_CONFIG } from "@/constants/constants";
import { localStorageUtils } from "@/lib/utils/storage";

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Add seller token if available (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorageUtils.get<string>(AUTH_CONFIG.SELLER_TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshToken =
          localStorageUtils.get<string>("sellerRefreshToken");

        if (refreshToken) {
          // Import refreshToken function dynamically to avoid circular dependency
          const { refreshToken: refreshTokenFn } = await import(
            "../../features/auth/services/AuthService"
          );
          const response = await refreshTokenFn("seller");

          if (response.success && response.data?.accessToken) {
            const newToken = response.data.accessToken;
            processQueue(null, newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return axiosInstance(originalRequest);
          }
        }

        // If refresh fails, clear tokens and redirect
        throw new Error("Token refresh failed");
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Clear tokens and redirect to seller login on refresh failure
        if (typeof window !== "undefined") {
          localStorageUtils.remove(AUTH_CONFIG.SELLER_TOKEN_KEY);
          localStorageUtils.remove("sellerRefreshToken");

          // Only redirect if not already on auth pages
          const currentPath = window.location.pathname;
          if (
            !currentPath.includes("/seller/") &&
            !currentPath.includes("/auth/")
          ) {
            window.location.href = "/seller/login";
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just log and reject
    console.error("Seller API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
