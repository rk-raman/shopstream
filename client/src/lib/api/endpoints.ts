interface ApiEndpoint {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
}

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    // Customer auth
    customerRegister: (): ApiEndpoint => ({
      url: "/auth/customer/register",
      method: "POST",
    }),
    customerLogin: (): ApiEndpoint => ({
      url: "/auth/customer/login",
      method: "POST",
    }),
    customerLogout: (): ApiEndpoint => ({
      url: "/auth/customer/logout",
      method: "POST",
    }),
    // Seller auth
    sellerRegister: (): ApiEndpoint => ({
      url: "/auth/seller/register",
      method: "POST",
    }),
    sellerLogin: (): ApiEndpoint => ({
      url: "/auth/seller/login",
      method: "POST",
    }),
    sellerLogout: (): ApiEndpoint => ({
      url: "/auth/seller/logout",
      method: "POST",
    }),
    // Common auth
    refreshToken: (): ApiEndpoint => ({
      url: "/auth/refresh",
      method: "POST",
    }),
    verifyEmail: (): ApiEndpoint => ({
      url: "/auth/verify-email",
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
    getProduct: (id: string): ApiEndpoint => ({
      url: `/products/${id}`,
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
      url: "/products/categories",
      method: "GET",
    }),
  },

  // Cart endpoints
  CART: {
    getCart: (): ApiEndpoint => ({
      url: "/cart",
      method: "GET",
    }),
    addToCart: (): ApiEndpoint => ({
      url: "/cart/items",
      method: "POST",
    }),
    updateCartItem: (id: string): ApiEndpoint => ({
      url: `/cart/items/${id}`,
      method: "PUT",
    }),
    removeFromCart: (id: string): ApiEndpoint => ({
      url: `/cart/items/${id}`,
      method: "DELETE",
    }),
    clearCart: (): ApiEndpoint => ({
      url: "/cart",
      method: "DELETE",
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
      url: "/upload/product-images",
      method: "POST",
    }),
    uploadAvatar: (): ApiEndpoint => ({
      url: "/upload/avatar",
      method: "POST",
    }),
    uploadBanner: (): ApiEndpoint => ({
      url: "/upload/banner",
      method: "POST",
    }),
  },
} as const;
