const { body, param, query, validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");
const mongoose = require("mongoose");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new ApiError(400, "Validation Error", errorMessages);
  }
  next();
};

// Custom validators
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error("Invalid ID format");
  }
  return true;
};

const isStrongPassword = (value) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(value)) {
    throw new Error(
      "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
    );
  }
  return true;
};

const isValidPhone = (value) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    throw new Error("Please enter a valid 10-digit mobile number");
  }
  return true;
};

const isValidPincode = (value) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  if (!pincodeRegex.test(value)) {
    throw new Error("Please enter a valid 6-digit pincode");
  }
  return true;
};

// User registration validation
const validateUserRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").custom(isStrongPassword),
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone").optional().custom(isValidPhone),
  handleValidationErrors,
];

// User login validation
const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Password change validation
const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword").custom(isStrongPassword),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match");
    }
    return true;
  }),
  handleValidationErrors,
];

// Password reset request validation
const validatePasswordResetRequest = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  handleValidationErrors,
];

// Password reset validation
const validatePasswordReset = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword").custom(isStrongPassword),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match");
    }
    return true;
  }),
  handleValidationErrors,
];

// Profile update validation
const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone").optional().custom(isValidPhone),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value > new Date()) {
        throw new Error("Date of birth cannot be in the future");
      }
      return true;
    }),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
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
    .withMessage("Full name must be between 2 and 100 characters"),
  body("addressLine1")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Address line 1 must be between 5 and 200 characters"),
  body("addressLine2")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address line 2 cannot exceed 200 characters"),
  body("city")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be between 2 and 50 characters"),
  body("state")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be between 2 and 50 characters"),
  body("pincode").custom(isValidPincode),
  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be between 2 and 50 characters"),
  body("phone").custom(isValidPhone),
  body("landmark")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Landmark cannot exceed 100 characters"),
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
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

// Address ID validation
const validateAddressId = [
  param("addressId").custom(isValidObjectId),
  handleValidationErrors,
];

// User ID validation
const validateUserId = [
  param("userId").custom(isValidObjectId),
  handleValidationErrors,
];

// Wishlist validation
const validateWishlistAdd = [
  body("productId").custom(isValidObjectId),
  handleValidationErrors,
];

// Wishlist remove validation
const validateWishlistRemove = [
  param("productId").custom(isValidObjectId),
  handleValidationErrors,
];

// Query parameter validation for pagination
const validatePaginationQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sortBy").optional().isString().withMessage("sortBy must be a string"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be asc or desc"),
  handleValidationErrors,
];

// Search validation
const validateSearch = [
  query("search")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search query must be between 1 and 100 characters"),
  query("role")
    .optional()
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be customer, seller, or admin"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  handleValidationErrors,
];

// User preferences validation
const validateUserPreferences = [
  body("language")
    .optional()
    .isIn(["en", "hi", "ta", "te", "bn"])
    .withMessage("Language must be one of: en, hi, ta, te, bn"),
  body("currency")
    .optional()
    .isIn(["INR", "USD"])
    .withMessage("Currency must be INR or USD"),
  body("notifications.email")
    .optional()
    .isBoolean()
    .withMessage("Email notification preference must be a boolean"),
  body("notifications.sms")
    .optional()
    .isBoolean()
    .withMessage("SMS notification preference must be a boolean"),
  body("notifications.push")
    .optional()
    .isBoolean()
    .withMessage("Push notification preference must be a boolean"),
  body("privacy.showProfile")
    .optional()
    .isBoolean()
    .withMessage("Show profile preference must be a boolean"),
  body("privacy.showWishlist")
    .optional()
    .isBoolean()
    .withMessage("Show wishlist preference must be a boolean"),
  handleValidationErrors,
];

// Admin user update validation
const validateAdminUserUpdate = [
  body("role")
    .optional()
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be customer, seller, or admin"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("isEmailVerified")
    .optional()
    .isBoolean()
    .withMessage("isEmailVerified must be a boolean"),
  body("isPhoneVerified")
    .optional()
    .isBoolean()
    .withMessage("isPhoneVerified must be a boolean"),
  handleValidationErrors,
];

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      throw new ApiError(400, "No file uploaded");
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      throw new ApiError(400, `File type ${req.file.mimetype} is not allowed`);
    }

    // Check file size
    if (req.file.size > maxSize) {
      throw new ApiError(
        400,
        `File size ${req.file.size} exceeds maximum allowed size of ${maxSize}`
      );
    }

    next();
  };
};

// Avatar upload validation
const validateAvatarUpload = validateFileUpload(
  ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  2 * 1024 * 1024 // 2MB
);

// Custom sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        // Remove potential XSS attempts
        obj[key] = obj[key].replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          ""
        );
        // Remove HTML tags except basic formatting
        obj[key] = obj[key].replace(/<(?!\/?(b|i|u|strong|em)\b)[^>]*>/gi, "");
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// Address type validation
const validateAddressType = [
  param("type")
    .isIn(["home", "work", "other"])
    .withMessage("Address type must be home, work, or other"),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateProfileUpdate,
  validateAddress,
  validateAddressId,
  validateUserId,
  validateWishlistAdd,
  validateWishlistRemove,
  validatePaginationQuery,
  validateSearch,
  validateUserPreferences,
  validateAdminUserUpdate,
  validateFileUpload,
  validateAvatarUpload,
  sanitizeInput,
  validateAddressType,

  // Custom validators
  isValidObjectId,
  isStrongPassword,
  isValidPhone,
  isValidPincode,
};
