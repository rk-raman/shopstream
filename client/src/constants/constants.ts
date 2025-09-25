// App configuration constants
export const APP_CONFIG = {
  NAME: "ShopStream",
  VERSION: "1.0.0",
  DESCRIPTION: "Modern E-commerce Platform for Buyers and Sellers",
  SUPPORT_EMAIL: "support@shopstream.com",
  DEFAULT_CURRENCY: "USD",
  DEFAULT_LANGUAGE: "en",
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Authentication constants
export const AUTH_CONFIG = {
  TOKEN_STORAGE_KEY: "authToken",
  CUSTOMER_TOKEN_KEY: "customerToken",
  SELLER_TOKEN_KEY: "sellerToken",
  REFRESH_TOKEN_KEY: "refreshToken",
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

// User roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

// Order status constants
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
} as const;

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

// Product constants
export const PRODUCT_CONFIG = {
  MAX_IMAGES: 10,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PRODUCTS_PER_PAGE: 24,
  ORDERS_PER_PAGE: 10,
  REVIEWS_PER_PAGE: 10,
} as const;

// File upload constants
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "text/plain"],
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 254,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  ADDRESS_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 2000,
  REVIEW_MIN_LENGTH: 10,
  REVIEW_MAX_LENGTH: 1000,
} as const;

// Theme constants
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "theme",
  LANGUAGE: "language",
  CART: "cart",
  WISHLIST: "wishlist",
  RECENT_SEARCHES: "recentSearches",
  USER_PREFERENCES: "userPreferences",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SESSION_EXPIRED: "Your session has expired. Please login again.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logout successful!",
  REGISTRATION_SUCCESS: "Registration successful!",
  PROFILE_UPDATED: "Profile updated successfully!",
  PASSWORD_CHANGED: "Password changed successfully!",
  PRODUCT_ADDED: "Product added successfully!",
  PRODUCT_UPDATED: "Product updated successfully!",
  ORDER_PLACED: "Order placed successfully!",
  PAYMENT_SUCCESS: "Payment completed successfully!",
} as const;

// Route paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/signup",
  SELLER_LOGIN: "/seller/login",
  SELLER_REGISTER: "/seller/signup",
  SHOP: "/shop",
  PRODUCT_DETAILS: "/shop/products",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ACCOUNT: "/account",
  ORDERS: "/account/orders",
  ADDRESSES: "/account/addresses",
  WISHLIST: "/wishlist",
  SELLER_DASHBOARD: "/dashboard",
  SELLER_PRODUCTS: "/dashboard/products",
  SELLER_ORDERS: "/dashboard/orders",
  SELLER_CUSTOMERS: "/dashboard/customers",
  SELLER_SETTINGS: "/dashboard/settings",
} as const;

// Social media links
export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com/shopstream",
  TWITTER: "https://twitter.com/shopstream",
  INSTAGRAM: "https://instagram.com/shopstream",
  LINKEDIN: "https://linkedin.com/company/shopstream",
} as const;

// Contact information
export const CONTACT_INFO = {
  EMAIL: "contact@shopstream.com",
  PHONE: "+1-800-SHOPSTREAM",
  ADDRESS: "123 E-commerce St, Digital City, DC 12345",
  BUSINESS_HOURS: "Mon-Fri 9AM-6PM EST",
} as const;

// Feature flags
export const FEATURES = {
  WISHLIST_ENABLED: true,
  REVIEWS_ENABLED: true,
  CHAT_SUPPORT_ENABLED: true,
  MULTI_CURRENCY_ENABLED: false,
  DARK_MODE_ENABLED: true,
  NOTIFICATIONS_ENABLED: true,
} as const;
