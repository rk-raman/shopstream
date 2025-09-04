const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User.model");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const eventEmitter = require("../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../shared/events/eventTypes");

// Helper function to generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
};

// Register new user
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, ...(phone ? [{ phone }] : [])],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email or phone");
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Publish registration event
  eventEmitter.publish(USER_EVENTS.USER_REGISTERED, {
    userId: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    timestamp: new Date().toISOString(),
  });

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
    data: {
      user,
      accessToken,
    },
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(401, "Account is deactivated");
  }

  // Update login stats
  user.lastLoginAt = new Date();
  user.loginCount += 1;

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Publish login event
  eventEmitter.publish(USER_EVENTS.USER_LOGGED_IN, {
    userId: user._id,
    email: user.email,
    timestamp: new Date().toISOString(),
  });

  // Set refresh token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Remove password from response
  user.password = undefined;

  res.json({
    success: true,
    message: "Login successful",
    data: {
      user,
      accessToken,
    },
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  const userId = req.user._id;

  if (refreshToken) {
    // Remove refresh token from user's token list
    await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  // Clear refresh token cookie
  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// Refresh access token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not found");
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user._id
  );

  // Replace old refresh token with new one
  user.refreshTokens = user.refreshTokens.filter(
    (token) => token !== refreshToken
  );
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  // Set new refresh token cookie
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    data: {
      accessToken,
    },
  });
});

// Get current user
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  // Get user with password
  const user = await User.findById(userId).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

// Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Publish event for email service
  eventEmitter.publish("notification.send_email", {
    type: "password_reset",
    to: user.email,
    data: {
      firstName: user.firstName,
      resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    },
  });

  res.json({
    success: true,
    message: "Password reset email sent",
  });
});

// Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Hash token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Token is invalid or has expired");
  }

  // Update password and clear reset token
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Clear all refresh tokens (force re-login)
  user.refreshTokens = [];

  await user.save();

  res.json({
    success: true,
    message: "Password reset successful",
  });
});

// Verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

// Resend verification email
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await user.save();

  // Send verification email
  eventEmitter.publish("notification.send_email", {
    type: "email_verification",
    to: user.email,
    data: {
      firstName: user.firstName,
      verificationToken,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
    },
  });

  res.json({
    success: true,
    message: "Verification email sent",
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
