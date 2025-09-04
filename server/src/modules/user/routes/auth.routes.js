// auth.routes.js
const express = require("express");
const authController = require("../controllers/auth.controller");
const userValidators = require("../validators/user.validators");
const rateLimiter = require("../../../shared/middleware/rateLimiter");

const router = express.Router();

// Apply rate limiting to auth routes
router.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: "Too many authentication attempts, please try again later.",
  })
);

// Public routes
router.post(
  "/register",
  userValidators.validateRegister,
  authController.register
);
router.post("/login", userValidators.validateLogin, authController.login);
router.post(
  "/forgot-password",
  userValidators.validateEmail,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  userValidators.validateResetPassword,
  authController.resetPassword
);
router.get("/verify-email/:token", authController.verifyEmail);

// Semi-protected routes (require refresh token)
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

// Protected routes (require authentication)
const auth = require("../../../shared/middleware/auth");
router.use(auth);

router.get("/me", authController.getMe);
router.post(
  "/change-password",
  userValidators.validateChangePassword,
  authController.changePassword
);
router.post("/resend-verification", authController.resendVerificationEmail);

module.exports = router;
