interface ApiEndpoint {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}

export const API_ENDPOINTS = {
  // Authentication endpoints - UNIFIED for all user types
  AUTH: {
    // Unified auth endpoints (same for customers and sellers)
    register: (): ApiEndpoint => ({
      url: "/auth/register",
      method: "POST",
    }),
    login: (): ApiEndpoint => ({
      url: "/auth/login",
      method: "POST",
    }),
    logout: (): ApiEndpoint => ({
      url: "/auth/logout",
      method: "POST",
    }),
    refreshToken: (): ApiEndpoint => ({
      url: "/auth/refresh-token",
      method: "POST",
    }),
    me: (): ApiEndpoint => ({
      url: "/auth/me",
      method: "GET",
    }),
    verifyEmail: (token: string): ApiEndpoint => ({
      url: `/auth/verify-email/${token}`,
      method: "GET",
    }),
    resendVerification: (): ApiEndpoint => ({
      url: "/auth/resend-verification",
      method: "POST",
    }),
    forgotPassword: (): ApiEndpoint => ({
      url: "/auth/forgot-password",
      method: "POST",
    }),
    resetPassword: (): ApiEndpoint => ({
      url: "/auth/reset-password",
      method: "POST",
    }),
    changePassword: (): ApiEndpoint => ({
      url: "/auth/change-password",
      method: "POST",
    }),
    enableTwoFactor: (): ApiEndpoint => ({
      url: "/auth/enable-2fa",
      method: "POST",
    }),
    verifyTwoFactor: (): ApiEndpoint => ({
      url: "/auth/verify-2fa",
      method: "POST",
    }),
  },

  // User profile endpoints
  USER: {
    getProfile: (): ApiEndpoint => ({
      url: "/users/profile",
      method: "GET",
    }),
    updateProfile: (): ApiEndpoint => ({
      url: "/users/profile",
      method: "PUT",
    }),
    uploadAvatar: (): ApiEndpoint => ({
      url: "/users/avatar",
      method: "POST",
    }),
    deleteAccount: (): ApiEndpoint => ({
      url: "/users/delete-account",
      method: "DELETE",
    }),
    getAddresses: (): ApiEndpoint => ({
      url: "/users/addresses",
      method: "GET",
    }),
    addAddress: (): ApiEndpoint => ({
      url: "/users/addresses",
      method: "POST",
    }),
    updateAddress: (id: string): ApiEndpoint => ({
      url: `/users/addresses/${id}`,
      method: "PUT",
    }),
    deleteAddress: (id: string): ApiEndpoint => ({
      url: `/users/addresses/${id}`,
      method: "DELETE",
    }),
  },

  // Product endpoints
  PRODUCTS: {
    getProducts: (): ApiEndpoint => ({
      url: "/products",
      method: "GET",
    }),
    getFeatureProducts: (): ApiEndpoint => ({
      url: "/products/featured",
      method: "GET",
    }),
    getProduct: (id: string): ApiEndpoint => ({
      url: `/products/${id}`,
      method: "GET",
    }),
    getProductBySlug: (slug: string): ApiEndpoint => ({
      url: `/products/slug/${slug}`,
      method: "GET",
    }),
    createProduct: (): ApiEndpoint => ({
      url: "/products",
      method: "POST",
    }),
    updateProduct: (id: string): ApiEndpoint => ({
      url: `/products/${id}`,
      method: "PUT",
    }),
    deleteProduct: (id: string): ApiEndpoint => ({
      url: `/products/${id}`,
      method: "DELETE",
    }),
    bulkDeleteProducts: (): ApiEndpoint => ({
      url: "/products/bulk-delete",
      method: "DELETE",
    }),
    bulkUpdateProducts: (): ApiEndpoint => ({
      url: "/products/bulk-update",
      method: "PUT",
    }),
    getMyProducts: (): ApiEndpoint => ({
      url: "/products/my/products",
      method: "GET",
    }),
    getProductReviews: (id: string): ApiEndpoint => ({
      url: `/products/${id}/reviews`,
      method: "GET",
    }),
    addProductReview: (id: string): ApiEndpoint => ({
      url: `/products/${id}/reviews`,
      method: "POST",
    }),
    searchProducts: (): ApiEndpoint => ({
      url: "/products/search",
      method: "GET",
    }),
    getCategories: (): ApiEndpoint => ({
      url: "/categories",
      method: "GET",
    }),
    getBrands: (): ApiEndpoint => ({
      url: "/products/brands",
      method: "GET",
    }),
    getProductStats: (): ApiEndpoint => ({
      url: "/products/stats",
      method: "GET",
    }),
    updateProductStatus: (id: string): ApiEndpoint => ({
      url: `/products/${id}/status`,
      method: "PATCH",
    }),
    uploadProductImages: (): ApiEndpoint => ({
      url: "/products/upload-images",
      method: "POST",
    }),
  },

  // Cart endpoints
  CART: {
    getCart: (): ApiEndpoint => ({
      url: "/cart",
      method: "GET",
    }),
    addToCart: (): ApiEndpoint => ({
      url: "/cart/add",
      method: "POST",
    }),
    updateCartItem: (id: string): ApiEndpoint => ({
      url: `/cart/item/${id}`,
      method: "PUT",
    }),
    removeFromCart: (id: string): ApiEndpoint => ({
      url: `/cart/item/${id}`,
      method: "DELETE",
    }),
    clearCart: (): ApiEndpoint => ({
      url: "/cart",
      method: "DELETE",
    }),
    applyPromoCode: (): ApiEndpoint => ({
      url: "/cart/apply-promo",
      method: "POST",
    }),
    removePromoCode: (): ApiEndpoint => ({
      url: "/cart/remove-promo",
      method: "DELETE",
    }),
    syncCart: (): ApiEndpoint => ({
      url: "/cart/sync",
      method: "POST",
    }),
  },

  // Order endpoints
  ORDERS: {
    getOrders: (): ApiEndpoint => ({
      url: "/orders",
      method: "GET",
    }),
    getOrder: (id: string): ApiEndpoint => ({
      url: `/orders/${id}`,
      method: "GET",
    }),
    createOrder: (): ApiEndpoint => ({
      url: "/orders",
      method: "POST",
    }),
    updateOrderStatus: (id: string): ApiEndpoint => ({
      url: `/orders/${id}/status`,
      method: "PUT",
    }),
    cancelOrder: (id: string): ApiEndpoint => ({
      url: `/orders/${id}/cancel`,
      method: "POST",
    }),
  },

  // Payment endpoints
  PAYMENTS: {
    createPaymentIntent: (): ApiEndpoint => ({
      url: "/payments/intent",
      method: "POST",
    }),
    confirmPayment: (): ApiEndpoint => ({
      url: "/payments/confirm",
      method: "POST",
    }),
    getPaymentMethods: (): ApiEndpoint => ({
      url: "/payments/methods",
      method: "GET",
    }),
    addPaymentMethod: (): ApiEndpoint => ({
      url: "/payments/methods",
      method: "POST",
    }),
    deletePaymentMethod: (id: string): ApiEndpoint => ({
      url: `/payments/methods/${id}`,
      method: "DELETE",
    }),
  },

  // Seller dashboard endpoints
  SELLER: {
    getDashboard: (): ApiEndpoint => ({
      url: "/seller/dashboard",
      method: "GET",
    }),
    getSellerProducts: (): ApiEndpoint => ({
      url: "/seller/products",
      method: "GET",
    }),
    getSellerOrders: (): ApiEndpoint => ({
      url: "/seller/orders",
      method: "GET",
    }),
    getSellerCustomers: (): ApiEndpoint => ({
      url: "/seller/customers",
      method: "GET",
    }),
    updateSellerSettings: (): ApiEndpoint => ({
      url: "/seller/settings",
      method: "PUT",
    }),
  },

  // Upload endpoints
  UPLOAD: {
    uploadProductImages: (): ApiEndpoint => ({
      url: "/upload/products/images",
      method: "POST",
    }),
    uploadAvatar: (): ApiEndpoint => ({
      url: "/upload/avatar",
      method: "POST",
    }),
    uploadBanner: (): ApiEndpoint => ({
      url: "/upload/banners",
      method: "POST",
    }),
    uploadBrandLogo: (brandId: string): ApiEndpoint => ({
      url: `/upload/brands/${brandId}/logo`,
      method: "POST",
    }),
    uploadBrandBanner: (brandId: string): ApiEndpoint => ({
      url: `/upload/brands/${brandId}/banner`,
      method: "POST",
    }),
    uploadBrandImages: (brandId: string): ApiEndpoint => ({
      url: `/upload/brands/${brandId}/images`,
      method: "POST",
    }),
    uploadCollectionImage: (collectionId: string): ApiEndpoint => ({
      url: `/upload/collections/${collectionId}/image`,
      method: "POST",
    }),
    uploadCategoryImage: (categoryId: string): ApiEndpoint => ({
      url: `/upload/categories/${categoryId}/image`,
      method: "POST",
    }),
  },

  // Collections endpoints
  COLLECTIONS: {
    // Public endpoints
    getCollections: (): ApiEndpoint => ({
      url: "/collections",
      method: "GET",
    }),
    getCollection: (id: string): ApiEndpoint => ({
      url: `/collections/${id}`,
      method: "GET",
    }),
    getCollectionByHandle: (handle: string): ApiEndpoint => ({
      url: `/collections/handle/${handle}`,
      method: "GET",
    }),
    getCollectionProducts: (id: string): ApiEndpoint => ({
      url: `/collections/${id}/products`,
      method: "GET",
    }),
    getPublishedCollections: (): ApiEndpoint => ({
      url: "/collections/published",
      method: "GET",
    }),
    searchCollections: (): ApiEndpoint => ({
      url: "/collections/search",
      method: "GET",
    }),
    getCollectionsBySeller: (sellerId: string): ApiEndpoint => ({
      url: `/collections/seller/${sellerId}`,
      method: "GET",
    }),

    // Authenticated endpoints
    getMyCollections: (): ApiEndpoint => ({
      url: "/collections/my/collections",
      method: "GET",
    }),
    getCollectionStats: (): ApiEndpoint => ({
      url: "/collections/stats/overview",
      method: "GET",
    }),

    // Seller/Admin endpoints
    createCollection: (): ApiEndpoint => ({
      url: "/collections",
      method: "POST",
    }),
    updateCollection: (id: string): ApiEndpoint => ({
      url: `/collections/${id}`,
      method: "PUT",
    }),
    deleteCollection: (id: string): ApiEndpoint => ({
      url: `/collections/${id}`,
      method: "DELETE",
    }),
    duplicateCollection: (id: string): ApiEndpoint => ({
      url: `/collections/${id}/duplicate`,
      method: "POST",
    }),
    updateCollectionVisibility: (id: string): ApiEndpoint => ({
      url: `/collections/${id}/visibility`,
      method: "PATCH",
    }),
    addProductsToCollection: (id: string): ApiEndpoint => ({
      url: `/collections/${id}/products`,
      method: "POST",
    }),
    removeProductsFromCollection: (id: string): ApiEndpoint => ({
      url: `/collections/${id}/products`,
      method: "DELETE",
    }),
    bulkUpdateCollections: (): ApiEndpoint => ({
      url: "/collections/bulk/update",
      method: "PATCH",
    }),
    uploadCollectionImage: (id: string): ApiEndpoint => ({
      url: `/collections/${id}/image`,
      method: "POST",
    }),
    removeCollectionImage: (id: string): ApiEndpoint => ({
      url: `/collections/${id}/image`,
      method: "DELETE",
    }),
  },
} as const;
