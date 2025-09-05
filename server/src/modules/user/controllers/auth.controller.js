const asyncHandler = require("../../../shared/utils/asyncHandler");
const authService = require("../services/auth.service");

// Register
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(
    req.body
  );

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

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

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Login successful",
    data: { user, accessToken },
  });
});

// Logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  await authService.logout(req.user._id, refreshToken);

  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(refreshToken);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

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
