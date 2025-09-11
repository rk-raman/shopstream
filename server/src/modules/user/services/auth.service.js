const crypto = require("crypto");
const User = require("../models/User.model");
const ApiError = require("../../../shared/utils/apiError");
const UserEventPublisher = require("../events/publishers/UserEventPublisher");
const {
  generateTokenPair,
  verifyRefreshToken,
  verifyAccessToken,
} = require("../../../shared/utils/jwt");

// Initialize event publisher
const userEventPublisher = new UserEventPublisher();

// Register new user
const register = async (userData) => {
  // Execution will pause here when breakpoint is hit
  console.log("🚀 [AUTH] Register function called with data:", {
    userData: userData,
  });

  try {
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        ...(userData.phone ? [{ phone: userData.phone }] : []),
      ],
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists with this email or phone");
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      ...userData,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Publish registration event
    await userEventPublisher.publishUserRegistered({
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      registrationMethod: "email",
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
      referrer: userData.referrer,
    });

    // Send verification email
    await userEventPublisher.eventEmitter.publish("notification.send_email", {
      type: "email_verification",
      to: user.email,
      data: {
        firstName: user.firstName,
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      },
    });

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

// Login user
const login = async (email, password, userData = {}) => {
  try {
    // Find user with password and refreshTokens
    const user = await User.findOne({ email }).select(
      "+password +refreshTokens"
    );

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
    const { accessToken, refreshToken } = generateTokenPair(user._id);

    // Store refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Publish login event
    await userEventPublisher.publishUserLoggedIn({
      userId: user._id,
      email: user.email,
      loginMethod: "email",
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
      sessionId: userData.sessionId,
    });

    // Remove password from response
    user.password = undefined;

    return { user, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

// Logout user
const logout = async (userId, refreshToken) => {
  try {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    return { message: "Logged out successfully" };
  } catch (error) {
    throw error;
  }
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new ApiError(401, "Refresh token not found");
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId).select("+refreshTokens");

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (!user.isActive) {
      throw new ApiError(401, "Account is deactivated");
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
      user._id
    );

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw error;
  }
};

// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password +refreshTokens");

    if (!(await user.comparePassword(currentPassword))) {
      throw new ApiError(400, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];

    await user.save();

    return { message: "Password changed successfully" };
  } catch (error) {
    throw error;
  }
};

// Forgot password
const forgotPassword = async (email) => {
  try {
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

    // Send reset email
    await userEventPublisher.eventEmitter.publish("notification.send_email", {
      type: "password_reset",
      to: user.email,
      data: {
        firstName: user.firstName,
        resetToken,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      },
    });

    return { message: "Password reset email sent" };
  } catch (error) {
    throw error;
  }
};

// Reset password
const resetPassword = async (token, newPassword) => {
  try {
    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+refreshTokens");

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

    return { message: "Password reset successful" };
  } catch (error) {
    throw error;
  }
};

// Verify email
const verifyEmail = async (token) => {
  try {
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

    return { message: "Email verified successfully" };
  } catch (error) {
    throw error;
  }
};

// Resend verification email
const resendVerificationEmail = async (userId) => {
  try {
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
    await userEventPublisher.eventEmitter.publish("notification.send_email", {
      type: "email_verification",
      to: user.email,
      data: {
        firstName: user.firstName,
        verificationToken,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
      },
    });

    return { message: "Verification email sent" };
  } catch (error) {
    throw error;
  }
};

// Validate user by token
const validateUserByToken = async (token, tokenType = "access") => {
  try {
    const decoded =
      tokenType === "access"
        ? verifyAccessToken(token)
        : verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(401, "Account is deactivated");
    }

    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  validateUserByToken,
};
