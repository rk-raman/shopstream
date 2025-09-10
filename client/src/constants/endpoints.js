export const API_ENDPOINTS = {
  AUTH: {
    register: () => ({
      url: "/api/v1/investor/user",
      method: "POST",
    }),
    loginWithPassword: () => ({
      url: "/api/v1/investor/login/password",
      method: "POST",
    }),
    verifyOtp: () => ({
      url: "/api/v1/investor/login/otp",
      method: "POST",
    }),
    resendOtp: () => ({
      url: "/api/v1/investor/send/otp",
      method: "POST",
    }),
    getProfile: () => ({
      url: "/api/v1/investor/profile",
      method: "GET",
    }),
    updateProfile: () => ({
      url: "/api/v1/investor/profile",
      method: "PUT",
    }),
    saveBillingDetails: () => ({
      url: "/api/v1/billing/details",
      method: "POST",
    }),
    refreshToken: () => ({
      url: "/api/v1/login/refresh",
      method: "POST",
    }),
  },
};
