const asyncHandler = require("../../../shared/utils/asyncHandler");
const authService = require("../services/auth.service");
const {
  clearRefreshTokenCookie,
  getRefreshTokenFromCookies,
  setRefreshTokenCookie,
} = require("../../../shared/utils/cookieUtils");

// Register
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(
    req.body
  );

  // Set refresh token as httpOnly cookie using utility
  setRefreshTokenCookie(res, refreshToken);

  return res.created({ user, accessToken }, "User registered successfully");
});

// Login
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body.email,
    req.body.password
  );

  // Set refresh token cookie using utility
  setRefreshTokenCookie(res, refreshToken);
  return res.success({ user, accessToken }, "Login successful");
});

// Logout
const logout = asyncHandler(async (req, res) => {
  const token = getRefreshTokenFromCookies(req);
  await authService.logout(req.user._id, token);

  // Clear refresh token cookie using utility
  clearRefreshTokenCookie(res);

  return res.success(null, "Logged out successfully");
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const token = getRefreshTokenFromCookies(req);

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(token);

  // Set new refresh token cookie using utility
  setRefreshTokenCookie(res, newRefreshToken);

  return res.success({ accessToken }, "Token refreshed successfully");
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );

  return res.success(null, "Password changed successfully");
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return res.success(null, "Password reset email sent");
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  return res.success(null, "Password reset successful");
});

// Verify email
const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.params.token);
  return res.success(null, "Email verified successfully");
});

// Resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.user._id);
  return res.success(null, "Verification email sent");
});

// Get current user
const getMe = asyncHandler(async (req, res) => {
  return res.success({ user: req.user }, "User profile retrieved successfully");
});

// Enable two-factor authentication
const enableTwoFactor = asyncHandler(async (req, res) => {
  const { secret, token } = req.body;
  const result = await authService.enableTwoFactor(req.user._id, secret, token);
  return res.success(result, "Two-factor authentication enabled successfully");
});

// Verify two-factor authentication
const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await authService.verifyTwoFactor(req.user._id, token);
  return res.success(result, "Two-factor authentication verified successfully");
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  getMe,
  enableTwoFactor,
  verifyTwoFactor,
};
