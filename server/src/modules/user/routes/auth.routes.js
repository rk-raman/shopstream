// auth.routes.js
const express = require("express");
const authController = require("../controllers/auth.controller");
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerification,
  validateResendVerification,
  validateTwoFactor,
} = require("../validators/joiValidators");
const {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  resetRateLimitOnLogin,
  trackFailedAttempts,
} = require("../../../shared/middleware/rateLimiter.middleware");
const { authenticate } = require("../../../shared/middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post(
  "/register",
  authLimiter, // strict limiter for registration
  validateRegister,
  authController.register
);

router.post(
  "/login",
  loginLimiter, // special limiter for login attempts
  trackFailedAttempts, // track failures
  validateLogin,
  authController.login,
  resetRateLimitOnLogin // reset limiter if login succeeds
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateForgotPassword,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  passwordResetLimiter, // also restrict reset attempts
  validateResetPassword,
  authController.resetPassword
);

router.get(
  "/verify-email/:token",
  validateEmailVerification,
  authController.verifyEmail
);

router.post(
  "/resend-verification",
  emailVerificationLimiter, // limit resend attempts
  validateResendVerification,
  authController.resendVerificationEmail
);

// Semi-protected routes
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

// Protected routes
router.use(authenticate);
router.get("/me", authController.getMe);
router.post(
  "/change-password",
  validateChangePassword,
  authController.changePassword
);

// Two-factor authentication routes
router.post("/enable-2fa", validateTwoFactor, authController.enableTwoFactor);

router.post("/verify-2fa", validateTwoFactor, authController.verifyTwoFactor);

module.exports = router;
