const { body, param, query, validationResult } = require("express-validator");
const ApiError = require("../../../shared/utils/apiError");

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;

    // Pass errors array directly, not nested
    throw new ApiError(400, message, "VALIDATION_ERROR", errors.array());
  }

  next();
};

// Register validation
const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),
  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please enter a valid 10-digit mobile number"),
  handleValidationErrors,
];

// Login validation
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail()
    .toLowerCase(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),
  handleValidationErrors,
];

// Change password validation
const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    )
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match");
    }
    return true;
  }),
  handleValidationErrors,
];

// Email validation
const validateEmail = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail()
    .toLowerCase(),
  handleValidationErrors,
];

// Reset password validation
const validateResetPassword = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 32, max: 128 })
    .withMessage("Invalid reset token format"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
    ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match");
    }
    return true;
  }),
  handleValidationErrors,
];

// Profile update validation
const validateUpdateProfile = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces"),
  body("phone")
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please enter a valid 10-digit mobile number"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please enter a valid date")
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error("Age must be between 13 and 120 years");
      }
      return true;
    }),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
  body("preferences.language")
    .optional()
    .isIn(["en", "hi", "ta", "te", "bn"])
    .withMessage("Language must be one of: en, hi, ta, te, bn"),
  body("preferences.currency")
    .optional()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be INR or USD"),
  body("preferences.notifications.email")
    .optional()
    .isBoolean()
    .withMessage("Email notification preference must be boolean"),
  body("preferences.notifications.sms")
    .optional()
    .isBoolean()
    .withMessage("SMS notification preference must be boolean"),
  body("preferences.notifications.push")
    .optional()
    .isBoolean()
    .withMessage("Push notification preference must be boolean"),
  handleValidationErrors,
];

// Address validation
const validateAddress = [
  body("type")
    .optional()
    .isIn(["home", "work", "other"])
    .withMessage("Address type must be home, work, or other"),
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2-100 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name can only contain letters and spaces"),
  body("addressLine1")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address line 1 must be between 5-200 characters"),
  body("addressLine2")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address line 2 cannot exceed 200 characters"),
  body("city")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("City can only contain letters and spaces"),
  body("state")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("State can only contain letters and spaces"),
  body("pincode")
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage("Please enter a valid 6-digit pincode"),
  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2-50 characters"),
  body("phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Please enter a valid 10-digit mobile number"),
  body("landmark")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Landmark cannot exceed 100 characters"),
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be boolean"),
  body("coordinates.latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("coordinates.longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  handleValidationErrors,
];

// Product ID validation for wishlist
const validateProductId = [
  body("productId")
    .isMongoId()
    .withMessage("Please provide a valid product ID"),
  handleValidationErrors,
];

// MongoDB ObjectId validation
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Please provide a valid ${paramName}`),
  handleValidationErrors,
];

// Query parameters validation for pagination
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "firstName", "lastName", "email", "role"])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
  query("role")
    .optional()
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be customer, seller, or admin"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Search query must be between 2-100 characters"),
  handleValidationErrors,
];

// File upload validation (for avatar)
const validateFileUpload = [
  (req, res, next) => {
    if (!req.file) {
      throw new ApiError(400, "Please upload a file");
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new ApiError(400, "Only JPEG, PNG and WebP files are allowed");
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      throw new ApiError(400, "File size cannot exceed 5MB");
    }

    next();
  },
];

// Admin role validation
const validateAdminUpdate = [
  body("role")
    .optional()
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be customer, seller, or admin"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  body("isEmailVerified")
    .optional()
    .isBoolean()
    .withMessage("isEmailVerified must be boolean"),
  body("isPhoneVerified")
    .optional()
    .isBoolean()
    .withMessage("isPhoneVerified must be boolean"),
  handleValidationErrors,
];

// Two-factor authentication validation
const validateTwoFactor = [
  body("code")
    .isLength({ min: 6, max: 6 })
    .withMessage("2FA code must be 6 digits")
    .isNumeric()
    .withMessage("2FA code must contain only numbers"),
  handleValidationErrors,
];

// Bulk operations validation
const validateBulkOperation = [
  body("userIds")
    .isArray({ min: 1, max: 100 })
    .withMessage("userIds must be an array with 1-100 items"),
  body("userIds.*")
    .isMongoId()
    .withMessage("Each user ID must be a valid MongoDB ObjectId"),
  body("action")
    .isIn(["activate", "deactivate", "delete", "role_update"])
    .withMessage("Action must be activate, deactivate, delete, or role_update"),
  body("role")
    .if(body("action").equals("role_update"))
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be customer, seller, or admin"),
  handleValidationErrors,
];

// Export validation middleware
module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateEmail,
  validateResetPassword,
  validateUpdateProfile,
  validateAddress,
  validateProductId,
  validateMongoId,
  validatePagination,
  validateFileUpload,
  validateAdminUpdate,
  validateTwoFactor,
  validateBulkOperation,
  handleValidationErrors,
};
