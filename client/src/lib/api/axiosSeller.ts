import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { API_CONFIG, AUTH_CONFIG } from "@/constants/constants";
import { localStorageUtils } from "@/lib/utils/storage";

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
  (error: AxiosError) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Clear seller token and redirect to seller login on unauthorized
      if (typeof window !== "undefined") {
        localStorageUtils.remove(AUTH_CONFIG.SELLER_TOKEN_KEY);
        window.location.href = "/seller/login";
      }
    }

    console.error("Seller API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
