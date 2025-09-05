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

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { user, accessToken },
  });
});

// Login
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(
    req.body.email,
    req.body.password
  );

  // Set refresh token cookie using utility
  setRefreshTokenCookie(res, refreshToken);

  res.json({
    success: true,
    message: "Login successful",
    data: { user, accessToken },
  });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromCookies(req);
  await authService.logout(req.user._id, refreshToken);

  // Clear refresh token cookie using utility
  clearRefreshTokenCookie(res);

  res.json({ success: true, message: "Logged out successfully" });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromCookies(req);

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(refreshToken);

  // Set new refresh token cookie using utility
  setRefreshTokenCookie(res, newRefreshToken);

  res.json({ success: true, data: { accessToken } });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );

  res.json({ success: true, message: "Password changed successfully" });
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.json({ success: true, message: "Password reset email sent" });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res.json({ success: true, message: "Password reset successful" });
});

// Verify email
const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.params.token);
  res.json({ success: true, message: "Email verified successfully" });
});

// Resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.user._id);
  res.json({ success: true, message: "Verification email sent" });
});

// Get current user
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
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
};
