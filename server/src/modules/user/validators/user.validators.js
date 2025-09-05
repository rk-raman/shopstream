const {
  validateJoiBody,
  validateJoiQuery,
  validateJoiParams,
  validateJoiMultiple,
  validateFile,
  validateCustom,
  sanitizeMiddleware,
} = require("../../../shared/middleware/validation.middleware");

const {
  userRegistrationSchema,
  userLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,
  addressSchema,
  wishlistSchema,
  paginationSchema,
  searchSchema,
  adminUserUpdateSchema,
  bulkOperationSchema,
  twoFactorSchema,
  emailVerificationSchema,
  resendVerificationSchema,
  socialLoginSchema,
  commonPatterns,
} = require("./user.schemas");

// ==================== AUTHENTICATION VALIDATORS ====================

/**
 * User Registration Validation
 * Validates email, password strength, names, phone, and terms acceptance
 */
const validateRegister = [
  sanitizeMiddleware,
  validateJoiBody(userRegistrationSchema),
];

/**
 * User Login Validation
 * Validates email format and password presence
 */
const validateLogin = [sanitizeMiddleware, validateJoiBody(userLoginSchema)];

/**
 * Change Password Validation
 * Validates current password, new password strength, and confirmation match
 */
const validateChangePassword = [
  sanitizeMiddleware,
  validateJoiBody(changePasswordSchema),
];

/**
 * Forgot Password Validation
 * Validates email format for password reset request
 */
const validateForgotPassword = [
  sanitizeMiddleware,
  validateJoiBody(forgotPasswordSchema),
];

/**
 * Reset Password Validation
 * Validates reset token and new password with confirmation
 */
const validateResetPassword = [
  sanitizeMiddleware,
  validateJoiBody(resetPasswordSchema),
];

/**
 * Email Verification Validation
 * Validates verification token format
 */
const validateEmailVerification = [
  sanitizeMiddleware,
  validateJoiParams(emailVerificationSchema),
];

/**
 * Resend Verification Validation
 * Validates verification type (email or phone)
 */
const validateResendVerification = [
  sanitizeMiddleware,
  validateJoiBody(resendVerificationSchema),
];

/**
 * Social Login Validation
 * Validates social provider and token
 */
const validateSocialLogin = [
  sanitizeMiddleware,
  validateJoiBody(socialLoginSchema),
];

/**
 * Two-Factor Authentication Validation
 * Validates 6-digit numeric code
 */
const validateTwoFactor = [
  sanitizeMiddleware,
  validateJoiBody(twoFactorSchema),
];

// ==================== PROFILE VALIDATORS ====================

/**
 * Profile Update Validation
 * Validates optional profile fields with proper constraints
 */
const validateUpdateProfile = [
  sanitizeMiddleware,
  validateJoiBody(profileUpdateSchema),
];

/**
 * Avatar Upload Validation
 * Validates image file type and size
 */
const validateAvatarUpload = [
  validateFile({
    required: true,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxSize: 2 * 1024 * 1024, // 2MB
    fieldName: "avatar",
  }),
];

// ==================== ADDRESS VALIDATORS ====================

/**
 * Address Creation/Update Validation
 * Validates all address fields with proper constraints
 */
const validateAddress = [sanitizeMiddleware, validateJoiBody(addressSchema)];

/**
 * Address ID Validation
 * Validates MongoDB ObjectId for address operations
 */
const validateAddressId = [
  validateJoiParams({
    addressId: commonPatterns.objectId.required(),
  }),
];

// ==================== WISHLIST VALIDATORS ====================

/**
 * Wishlist Add Validation
 * Validates product ID for wishlist operations
 */
const validateWishlistAdd = [
  sanitizeMiddleware,
  validateJoiBody(wishlistSchema),
];

/**
 * Wishlist Remove Validation
 * Validates product ID from URL parameters
 */
const validateWishlistRemove = [
  validateJoiParams({
    productId: commonPatterns.objectId.required(),
  }),
];

// ==================== QUERY VALIDATORS ====================

/**
 * Pagination Validation
 * Validates pagination parameters (page, limit, sort)
 */
const validatePagination = [validateJoiQuery(paginationSchema)];

/**
 * Search Validation
 * Validates search query parameters with pagination
 */
const validateSearch = [validateJoiQuery(searchSchema)];

/**
 * User ID Validation
 * Validates MongoDB ObjectId for user operations
 */
const validateUserId = [
  validateJoiParams({
    userId: commonPatterns.objectId.required(),
  }),
];

// ==================== ADMIN VALIDATORS ====================

/**
 * Admin User Update Validation
 * Validates admin-specific user update fields
 */
const validateAdminUpdate = [
  sanitizeMiddleware,
  validateJoiBody(adminUserUpdateSchema),
];

/**
 * Bulk Operations Validation
 * Validates bulk user operations (activate, deactivate, etc.)
 */
const validateBulkOperation = [
  sanitizeMiddleware,
  validateJoiBody(bulkOperationSchema),
];

// ==================== CUSTOM VALIDATORS ====================

/**
 * Password Confirmation Validation
 * Custom validator to ensure password confirmation matches
 */
const validatePasswordConfirmation = validateCustom((req) => {
  const { password, confirmPassword } = req.body;
  return password === confirmPassword;
}, "Password confirmation does not match");

/**
 * Email Domain Validation
 * Custom validator for specific email domains
 */
const validateEmailDomain = (allowedDomains = []) => {
  return validateCustom((req) => {
    const email = req.body.email;
    if (!email || allowedDomains.length === 0) return true;

    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
  }, `Email must be from one of these domains: ${allowedDomains.join(", ")}`);
};

/**
 * Age Restriction Validation
 * Custom validator for minimum age requirements
 */
const validateMinimumAge = (minAge = 18) => {
  return validateCustom((req) => {
    const { dateOfBirth } = req.body;
    if (!dateOfBirth) return true;

    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age >= minAge;
  }, `You must be at least ${minAge} years old`);
};

/**
 * Unique Email Validation
 * Custom async validator to check email uniqueness
 */
const validateUniqueEmail = validateCustom(async (req) => {
  // This would typically check against database
  // For now, we'll assume it's unique
  return true;
}, "Email is already registered");

/**
 * Phone Number Format Validation
 * Custom validator for specific phone number formats
 */
const validatePhoneFormat = (countryCode = "IN") => {
  return validateCustom((req) => {
    const { phone } = req.body;
    if (!phone) return true;

    // Indian phone number validation
    if (countryCode === "IN") {
      return /^[6-9]\d{9}$/.test(phone);
    }

    return true;
  }, "Please enter a valid phone number");
};

/**
 * File Type Validation
 * Custom validator for specific file types
 */
const validateFileType = (allowedTypes = []) => {
  return validateCustom((req) => {
    const file = req.file;
    if (!file || allowedTypes.length === 0) return true;

    return allowedTypes.includes(file.mimetype);
  }, `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`);
};

/**
 * Conditional Validation
 * Validates fields based on other field values
 */
const validateConditional = (condition, schema) => {
  return validateCustom((req) => {
    if (condition(req)) {
      // Apply additional validation
      const { error } = schema.validate(req.body);
      return !error;
    }
    return true;
  }, "Conditional validation failed");
};

// ==================== COMPOSITE VALIDATORS ====================

/**
 * Complete User Registration with Terms
 * Combines registration validation with terms acceptance
 */
const validateCompleteRegistration = [
  sanitizeMiddleware,
  validateJoiBody(userRegistrationSchema),
  validateCustom(
    (req) => req.body.acceptTerms === true,
    "You must accept the terms and conditions"
  ),
];

/**
 * Profile Update with Avatar
 * Combines profile update with optional avatar upload
 */
const validateProfileUpdateWithAvatar = [
  sanitizeMiddleware,
  validateJoiBody(profileUpdateSchema),
  validateFile({
    required: false,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxSize: 2 * 1024 * 1024,
    fieldName: "avatar",
  }),
];

/**
 * Address with Coordinates
 * Validates address with optional coordinate validation
 */
const validateAddressWithCoordinates = [
  sanitizeMiddleware,
  validateJoiBody(addressSchema),
  validateCustom((req) => {
    const { coordinates } = req.body;
    if (!coordinates) return true;

    const { latitude, longitude } = coordinates;
    return (
      latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    );
  }, "Invalid coordinates provided"),
];

// ==================== EXPORT ALL VALIDATORS ====================

module.exports = {
  // Authentication validators
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateEmailVerification,
  validateResendVerification,
  validateSocialLogin,
  validateTwoFactor,

  // Profile validators
  validateUpdateProfile,
  validateAvatarUpload,

  // Address validators
  validateAddress,
  validateAddressId,

  // Wishlist validators
  validateWishlistAdd,
  validateWishlistRemove,

  // Query validators
  validatePagination,
  validateSearch,
  validateUserId,

  // Admin validators
  validateAdminUpdate,
  validateBulkOperation,

  // Custom validators
  validatePasswordConfirmation,
  validateEmailDomain,
  validateMinimumAge,
  validateUniqueEmail,
  validatePhoneFormat,
  validateFileType,
  validateConditional,

  // Composite validators
  validateCompleteRegistration,
  validateProfileUpdateWithAvatar,
  validateAddressWithCoordinates,

  // Utility
  sanitizeMiddleware,
};
