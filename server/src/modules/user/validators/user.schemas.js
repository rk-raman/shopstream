const Joi = require("joi");
const mongoose = require("mongoose");

// Custom Joi extensions for common validations
const customJoi = Joi.extend({
  type: "objectId",
  base: Joi.string(),
  messages: {
    "objectId.base": "{{#label}} must be a valid MongoDB ObjectId",
  },
  validate(value, helpers) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return { value, errors: helpers.error("objectId.base") };
    }
    return { value };
  },
});

const customJoiExtended = customJoi.extend({
  type: "phone",
  base: Joi.string(),
  messages: {
    "phone.base": "{{#label}} must be a valid 10-digit Indian mobile number",
  },
  validate(value, helpers) {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return { value, errors: helpers.error("phone.base") };
    }
    return { value };
  },
});

const customJoiWithPincode = customJoiExtended.extend({
  type: "pincode",
  base: Joi.string(),
  messages: {
    "pincode.base": "{{#label}} must be a valid 6-digit Indian pincode",
  },
  validate(value, helpers) {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(value)) {
      return { value, errors: helpers.error("pincode.base") };
    }
    return { value };
  },
});

// Common validation patterns
const commonPatterns = {
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
    }),

  strongPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)",
      "string.empty": "Password is required",
    }),

  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .trim()
    .messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 50 characters",
      "string.pattern.base": "Name can only contain letters and spaces",
      "string.empty": "Name is required",
    }),

  phone: customJoiExtended.phone(),

  objectId: customJoi.objectId(),

  pincode: customJoiWithPincode.pincode(),

  dateOfBirth: Joi.date()
    .max("now")
    .custom((value, helpers) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 13) {
        return helpers.error("date.min", { limit: 13 });
      }
      if (age > 120) {
        return helpers.error("date.max", { limit: 120 });
      }
      return value;
    })
    .messages({
      "date.max": "Date of birth cannot be in the future",
      "date.min": "Age must be at least 13 years",
      "date.max": "Age cannot exceed 120 years",
    }),
};

// User Registration Schema
const userRegistrationSchema = Joi.object({
  email: commonPatterns.email.required(),
  password: commonPatterns.strongPassword.required(),
  firstName: commonPatterns.name.required(),
  lastName: commonPatterns.name.required(),
  phone: commonPatterns.phone.optional(),
  dateOfBirth: commonPatterns.dateOfBirth.optional(),
  gender: Joi.string().valid("male", "female", "other").optional().messages({
    "any.only": "Gender must be male, female, or other",
  }),
  marketingConsent: Joi.boolean().optional(),
});

// User Login Schema
const userLoginSchema = Joi.object({
  email: commonPatterns.email.required(),
  password: Joi.string().min(1).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password cannot be empty",
  }),
  rememberMe: Joi.boolean().optional(),
});

// Change Password Schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
  }),
  newPassword: commonPatterns.strongPassword.required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Password confirmation does not match",
      "string.empty": "Password confirmation is required",
    }),
});

// Forgot Password Schema
const forgotPasswordSchema = Joi.object({
  email: commonPatterns.email.required(),
});

// Reset Password Schema
const resetPasswordSchema = Joi.object({
  token: Joi.string().min(32).max(128).required().messages({
    "string.min": "Invalid reset token format",
    "string.max": "Invalid reset token format",
    "string.empty": "Reset token is required",
  }),
  newPassword: commonPatterns.strongPassword.required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Password confirmation does not match",
      "string.empty": "Password confirmation is required",
    }),
});

// Profile Update Schema
const profileUpdateSchema = Joi.object({
  firstName: commonPatterns.name.optional(),
  lastName: commonPatterns.name.optional(),
  phone: commonPatterns.phone.optional(),
  dateOfBirth: commonPatterns.dateOfBirth.optional(),
  gender: Joi.string().valid("male", "female", "other").optional().messages({
    "any.only": "Gender must be male, female, or other",
  }),
  bio: Joi.string().max(500).optional().messages({
    "string.max": "Bio cannot exceed 500 characters",
  }),
  preferences: Joi.object({
    language: Joi.string()
      .valid("en", "hi", "ta", "te", "bn", "gu", "mr", "kn", "ml", "pa")
      .optional()
      .messages({
        "any.only":
          "Language must be one of: en, hi, ta, te, bn, gu, mr, kn, ml, pa",
      }),
    currency: Joi.string()
      .valid("INR", "USD", "EUR", "GBP")
      .optional()
      .messages({
        "any.only": "Currency must be INR, USD, EUR, or GBP",
      }),
    timezone: Joi.string().optional().messages({
      "string.base": "Timezone must be a valid timezone string",
    }),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
      marketing: Joi.boolean().optional(),
    }).optional(),
    privacy: Joi.object({
      showProfile: Joi.boolean().optional(),
      showWishlist: Joi.boolean().optional(),
      showOrders: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
});

// Address Schema
const addressSchema = Joi.object({
  type: Joi.string().valid("home", "work", "other").optional().messages({
    "any.only": "Address type must be home, work, or other",
  }),
  fullName: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .trim()
    .required()
    .messages({
      "string.min": "Full name must be at least 2 characters long",
      "string.max": "Full name cannot exceed 100 characters",
      "string.pattern.base": "Full name can only contain letters and spaces",
      "string.empty": "Full name is required",
    }),
  addressLine1: Joi.string().min(5).max(200).trim().required().messages({
    "string.min": "Address line 1 must be at least 5 characters long",
    "string.max": "Address line 1 cannot exceed 200 characters",
    "string.empty": "Address line 1 is required",
  }),
  addressLine2: Joi.string().max(200).trim().optional().allow("").messages({
    "string.max": "Address line 2 cannot exceed 200 characters",
  }),
  city: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .trim()
    .required()
    .messages({
      "string.min": "City must be at least 2 characters long",
      "string.max": "City cannot exceed 50 characters",
      "string.pattern.base": "City can only contain letters and spaces",
      "string.empty": "City is required",
    }),
  state: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .trim()
    .required()
    .messages({
      "string.min": "State must be at least 2 characters long",
      "string.max": "State cannot exceed 50 characters",
      "string.pattern.base": "State can only contain letters and spaces",
      "string.empty": "State is required",
    }),
  pincode: commonPatterns.pincode.required(),
  country: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .default("India")
    .messages({
      "string.min": "Country must be at least 2 characters long",
      "string.max": "Country cannot exceed 50 characters",
    }),
  phone: commonPatterns.phone.required(),
  landmark: Joi.string().max(100).trim().optional().allow("").messages({
    "string.max": "Landmark cannot exceed 100 characters",
  }),
  isDefault: Joi.boolean().optional(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).optional().messages({
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
    }),
    longitude: Joi.number().min(-180).max(180).optional().messages({
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
    }),
  }).optional(),
});

// Wishlist Schema
const wishlistSchema = Joi.object({
  productId: commonPatterns.objectId.required(),
});

// Pagination Schema
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
  sortBy: Joi.string()
    .valid(
      "createdAt",
      "updatedAt",
      "firstName",
      "lastName",
      "email",
      "role",
      "lastLoginAt"
    )
    .optional()
    .default("createdAt")
    .messages({
      "any.only":
        "Invalid sort field. Must be one of: createdAt, updatedAt, firstName, lastName, email, role, lastLoginAt",
    }),
  sortOrder: Joi.string()
    .valid("asc", "desc")
    .optional()
    .default("desc")
    .messages({
      "any.only": "Sort order must be asc or desc",
    }),
});

// Search Schema
const searchSchema = paginationSchema.keys({
  search: Joi.string().min(2).max(100).trim().optional().messages({
    "string.min": "Search query must be at least 2 characters long",
    "string.max": "Search query cannot exceed 100 characters",
  }),
  role: Joi.string().valid("customer", "seller", "admin").optional().messages({
    "any.only": "Role must be customer, seller, or admin",
  }),
  isActive: Joi.boolean().optional(),
  isEmailVerified: Joi.boolean().optional(),
  isPhoneVerified: Joi.boolean().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().min(Joi.ref("dateFrom")).optional(),
});

// Admin User Update Schema
const adminUserUpdateSchema = Joi.object({
  role: Joi.string().valid("customer", "seller", "admin").optional().messages({
    "any.only": "Role must be customer, seller, or admin",
  }),
  isActive: Joi.boolean().optional(),
  isEmailVerified: Joi.boolean().optional(),
  isPhoneVerified: Joi.boolean().optional(),
  isLocked: Joi.boolean().optional(),
  lockReason: Joi.string()
    .max(200)
    .optional()
    .when("isLocked", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "string.max": "Lock reason cannot exceed 200 characters",
      "any.required": "Lock reason is required when locking account",
    }),
});

// Two-Factor Authentication Schema
const twoFactorSchema = Joi.object({
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.length": "2FA code must be exactly 6 digits",
      "string.pattern.base": "2FA code must contain only numbers",
      "string.empty": "2FA code is required",
    }),
});

// Bulk Operations Schema
const bulkOperationSchema = Joi.object({
  userIds: Joi.array()
    .items(commonPatterns.objectId)
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one user ID is required",
      "array.max": "Cannot process more than 100 users at once",
      "array.base": "userIds must be an array",
    }),
  action: Joi.string()
    .valid("activate", "deactivate", "delete", "role_update", "lock", "unlock")
    .required()
    .messages({
      "any.only":
        "Action must be one of: activate, deactivate, delete, role_update, lock, unlock",
    }),
  role: Joi.string()
    .valid("customer", "seller", "admin")
    .when("action", {
      is: "role_update",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.only": "Role must be customer, seller, or admin",
      "any.required": "Role is required when action is role_update",
    }),
  reason: Joi.string().max(200).optional().messages({
    "string.max": "Reason cannot exceed 200 characters",
  }),
});

// Email Verification Schema
const emailVerificationSchema = Joi.object({
  token: Joi.string().min(32).max(128).required().messages({
    "string.min": "Invalid verification token format",
    "string.max": "Invalid verification token format",
    "string.empty": "Verification token is required",
  }),
});

// Resend Verification Schema
const resendVerificationSchema = Joi.object({
  type: Joi.string().valid("email", "phone").required().messages({
    "any.only": "Type must be email or phone",
  }),
});

// Social Login Schema
const socialLoginSchema = Joi.object({
  provider: Joi.string()
    .valid("google", "facebook", "apple", "github")
    .required()
    .messages({
      "any.only": "Provider must be google, facebook, apple, or github",
    }),
  token: Joi.string().required().messages({
    "string.empty": "Social login token is required",
  }),
  userInfo: Joi.object({
    id: Joi.string().required(),
    email: commonPatterns.email.optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    avatar: Joi.string().uri().optional(),
  }).optional(),
});

// Export all schemas
module.exports = {
  // Core user schemas
  userRegistrationSchema,
  userLoginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  profileUpdateSchema,

  // Address schemas
  addressSchema,

  // Wishlist schemas
  wishlistSchema,

  // Query schemas
  paginationSchema,
  searchSchema,

  // Admin schemas
  adminUserUpdateSchema,
  bulkOperationSchema,

  // Authentication schemas
  twoFactorSchema,
  emailVerificationSchema,
  resendVerificationSchema,
  socialLoginSchema,

  // Common patterns for reuse
  commonPatterns,

  // Extended Joi with custom validators
  customJoi: customJoiWithPincode,
};
