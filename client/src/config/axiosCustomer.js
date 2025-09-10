import axios from "axios";
// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // replace with your backend URL
  timeout: 10000, // optional: request timeout in ms
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    // Example: Add token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally (optional)
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
