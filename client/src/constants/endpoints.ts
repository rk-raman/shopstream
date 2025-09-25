const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    CURRENT_USER: "/auth/me",
  },

  // Product endpoints
  PRODUCTS: {
    BASE: "/products",
    CREATE: "/products",
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    GET_BY_ID: (id: string) => `/products/${id}`,
    GET_BY_SLUG: (slug: string) => `/products/slug/${slug}`,
    GET_MY_PRODUCTS: "/products/my-products",
    BULK_DELETE: "/products/bulk-delete",
    BULK_UPDATE: "/products/bulk-update",
    UPDATE_STATUS: (id: string) => `/products/${id}/status`,
    UPLOAD_IMAGES: "/products/upload-images",
    SEARCH: "/products/search",
    STATS: "/products/stats",
    REVIEWS: (id: string) => `/products/${id}/reviews`,
    ADD_REVIEW: (id: string) => `/products/${id}/reviews`,
  },

  // Category endpoints
  CATEGORIES: {
    BASE: "/categories",
    CREATE: "/categories",
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
    GET_BY_ID: (id: string) => `/categories/${id}`,
    GET_TREE: "/categories/tree",
    GET_FEATURED: "/categories/featured",
    SEARCH: "/categories/search",
    BULK_DELETE: "/categories/bulk-delete",
    BULK_UPDATE: "/categories/bulk-update",
    UPLOAD_IMAGE: (id: string) => `/categories/${id}/image`,
  },

  // Brand endpoints
  BRANDS: {
    BASE: "/brands",
    CREATE: "/brands",
    UPDATE: (id: string) => `/brands/${id}`,
    DELETE: (id: string) => `/brands/${id}`,
    GET_BY_ID: (id: string) => `/brands/${id}`,
    GET_FEATURED: "/brands/featured",
    GET_VERIFIED: "/brands/verified",
    SEARCH: "/brands/search",
    BULK_DELETE: "/brands/bulk-delete",
    BULK_UPDATE: "/brands/bulk-update",
    UPLOAD_LOGO: (id: string) => `/brands/${id}/logo`,
    UPLOAD_BANNER: (id: string) => `/brands/${id}/banner`,
    GET_BY_ALPHABET: "/brands/alphabet",
  },

  // Collection endpoints
  COLLECTIONS: {
    BASE: "/collections",
    CREATE: "/collections",
    UPDATE: (id: string) => `/collections/${id}`,
    DELETE: (id: string) => `/collections/${id}`,
    GET_BY_ID: (id: string) => `/collections/${id}`,
    GET_BY_HANDLE: (handle: string) => `/collections/handle/${handle}`,
    GET_MY_COLLECTIONS: "/collections/my-collections",
    ADD_PRODUCTS: (id: string) => `/collections/${id}/products`,
    REMOVE_PRODUCTS: (id: string) => `/collections/${id}/products/remove`,
    BULK_DELETE: "/collections/bulk-delete",
    UPLOAD_IMAGE: (id: string) => `/collections/${id}/image`,
    SEARCH: "/collections/search",
  },

  // Upload endpoints
  UPLOADS: {
    AVATAR: "/uploads/avatar",
    PRODUCT_IMAGES: "/uploads/product-images",
    CATEGORY_IMAGE: "/uploads/category-image",
    BRAND_LOGO: "/uploads/brand-logo",
    BRAND_BANNER: "/uploads/brand-banner",
    COLLECTION_IMAGE: "/uploads/collection-image",
  },

  // User endpoints
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
  },
};

export default API_ENDPOINTS;
