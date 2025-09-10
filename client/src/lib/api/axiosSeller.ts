import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // Add seller token if available (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sellerToken");
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
        localStorage.removeItem("sellerToken");
        window.location.href = "/seller/login";
      }
    }

    console.error("Seller API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
