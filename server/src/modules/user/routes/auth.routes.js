// auth.routes.js
const express = require("express");
const authController = require("../controllers/auth.controller");
const userValidators = require("../validators/user.validators");
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
  userValidators.validateRegister,
  authController.register
);

router.post(
  "/login",
  loginLimiter, // special limiter for login attempts
  trackFailedAttempts, // track failures
  userValidators.validateLogin,
  authController.login,
  resetRateLimitOnLogin // reset limiter if login succeeds
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  userValidators.validateEmail,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  passwordResetLimiter, // also restrict reset attempts
  userValidators.validateResetPassword,
  authController.resetPassword
);

router.get("/verify-email/:token", authController.verifyEmail);

router.post(
  "/resend-verification",
  emailVerificationLimiter, // limit resend attempts
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
  userValidators.validateChangePassword,
  authController.changePassword
);

module.exports = router;
