const Joi = require("joi");
const { body, param, query, validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");
const HTTP_STATUS = require("../constants/httpStatus");
const ERROR_CODES = require("../constants/errorCodes");
const mongoose = require("mongoose");

// ==================== JOI VALIDATION MIDDLEWARE ====================

/**
 * Generic Joi validation middleware factory
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @param {Object} options - Additional validation options
 * @returns {Function} Express middleware function
 */
const validateJoi = (schema, source = "body", options = {}) => {
  return (req, res, next) => {
    try {
      // Get data from specified source
      const data = req[source];

      // Validation options
      const validationOptions = {
        abortEarly: false, // Get all validation errors
        allowUnknown: false, // Don't allow unknown fields
        stripUnknown: true, // Remove unknown fields
        ...options,
      };

      // Validate data
      const { error, value } = schema.validate(data, validationOptions);

      if (error) {
        // Format Joi errors to match your API error format
        const formattedErrors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
          value: detail.context?.value,
          type: detail.type,
        }));

        // Create a user-friendly error message
        const errorMessage =
          formattedErrors.length === 1
            ? formattedErrors[0].message
            : `Validation failed: ${formattedErrors
                .map((e) => e.message)
                .join(", ")}`;

        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          errorMessage,
          ERROR_CODES.VALIDATION_ERROR,
          formattedErrors
        );
      }

      // Replace original data with validated and sanitized data
      req[source] = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate request body using Joi
 * @param {Object} schema - Joi schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateJoiBody = (schema, options = {}) => {
  return validateJoi(schema, "body", options);
};

/**
 * Validate query parameters using Joi
 * @param {Object} schema - Joi schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateJoiQuery = (schema, options = {}) => {
  return validateJoi(schema, "query", options);
};

/**
 * Validate route parameters using Joi
 * @param {Object} schema - Joi schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateJoiParams = (schema, options = {}) => {
  return validateJoi(schema, "params", options);
};

/**
 * Validate multiple sources at once using Joi
 * @param {Object} schemas - Object with schema for each source
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateJoiMultiple = (schemas, options = {}) => {
  return (req, res, next) => {
    try {
      const errors = [];
      const validatedData = {};

      // Validate each source
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema && req[source]) {
          const validationOptions = {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
            ...options,
          };

          const { error, value } = schema.validate(
            req[source],
            validationOptions
          );

          if (error) {
            const formattedErrors = error.details.map((detail) => ({
              source,
              field: detail.path.join("."),
              message: detail.message,
              value: detail.context?.value,
              type: detail.type,
            }));
            errors.push(...formattedErrors);
          } else {
            validatedData[source] = value;
          }
        }
      }

      if (errors.length > 0) {
        const errorMessage =
          errors.length === 1
            ? errors[0].message
            : `Validation failed: ${errors.map((e) => e.message).join(", ")}`;

        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          errorMessage,
          ERROR_CODES.VALIDATION_ERROR,
          errors
        );
      }

      // Replace original data with validated data
      Object.assign(req, validatedData);
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Conditional validation middleware using Joi
 * @param {Function} condition - Function that returns true if validation should run
 * @param {Object} schema - Joi schema
 * @param {string} source - Source of data to validate
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateJoiConditional = (
  condition,
  schema,
  source = "body",
  options = {}
) => {
  return (req, res, next) => {
    if (condition(req)) {
      return validateJoi(schema, source, options)(req, res, next);
    }
    next();
  };
};

/**
 * File upload validation middleware
 * @param {Object} options - File validation options
 * @returns {Function} Express middleware
 */
const validateFile = (options = {}) => {
  const {
    required = true,
    allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxSize = 5 * 1024 * 1024, // 5MB
    fieldName = "file",
  } = options;

  return (req, res, next) => {
    try {
      const file = req.file || req.files?.[fieldName];

      if (required && !file) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "File upload is required",
          ERROR_CODES.FILE_REQUIRED
        );
      }

      if (file) {
        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `File type ${
              file.mimetype
            } is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
            ERROR_CODES.INVALID_FILE_TYPE
          );
        }

        // Check file size
        if (file.size > maxSize) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `File size ${(file.size / 1024 / 1024).toFixed(
              2
            )}MB exceeds maximum allowed size of ${(
              maxSize /
              1024 /
              1024
            ).toFixed(2)}MB`,
            ERROR_CODES.FILE_TOO_LARGE
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Custom validation middleware for business logic
 * @param {Function} validator - Validation function
 * @param {string} errorMessage - Error message if validation fails
 * @returns {Function} Express middleware
 */
const validateCustom = (
  validator,
  errorMessage = "Custom validation failed"
) => {
  return (req, res, next) => {
    try {
      const isValid = validator(req);
      if (!isValid) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          errorMessage,
          ERROR_CODES.CUSTOM_VALIDATION_ERROR
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Rate limiting validation (basic implementation)
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware
 */
const validateRateLimit = (options = {}) => {
  const {
    maxRequests = 100,
    windowMs = 15 * 60 * 1000, // 15 minutes
    keyGenerator = (req) => req.ip,
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [k, v] of requests.entries()) {
      if (v.timestamp < windowStart) {
        requests.delete(k);
      }
    }

    // Check current request count
    const current = requests.get(key);
    if (
      current &&
      current.count >= maxRequests &&
      current.timestamp > windowStart
    ) {
      throw new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        `Too many requests. Limit: ${maxRequests} per ${
          windowMs / 1000 / 60
        } minutes`,
        ERROR_CODES.RATE_LIMIT_EXCEEDED
      );
    }

    // Update request count
    if (current && current.timestamp > windowStart) {
      current.count++;
    } else {
      requests.set(key, { count: 1, timestamp: now });
    }

    next();
  };
};

/**
 * Sanitize input data to prevent XSS and other attacks
 * @param {Object} data - Data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeInput = (data) => {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const sanitized = Array.isArray(data) ? [] : {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      // Remove potential XSS attempts
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .trim();
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Pre-validation sanitization middleware
 * @returns {Function} Express middleware
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

// ==================== EXPRESS-VALIDATOR MIDDLEWARE ====================

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Validation Error",
      ERROR_CODES.VALIDATION_ERROR,
      errorMessages
    );
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

// ==================== COMMON JOI SCHEMAS ====================

// Common validation patterns for reuse across modules
const commonJoiPatterns = {
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

  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .messages({
      "string.pattern.base":
        "Please enter a valid 10-digit Indian mobile number",
    }),

  objectId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("objectId.base");
      }
      return value;
    })
    .messages({
      "objectId.base": "{{#label}} must be a valid MongoDB ObjectId",
    }),

  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .messages({
      "string.pattern.base":
        "{{#label}} must be a valid 6-digit Indian pincode",
    }),

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

  pagination: Joi.object({
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
    sortBy: Joi.string().optional().messages({
      "string.base": "Sort field must be a string",
    }),
    sortOrder: Joi.string()
      .valid("asc", "desc")
      .optional()
      .default("desc")
      .messages({
        "any.only": "Sort order must be asc or desc",
      }),
  }),
};

// ==================== EXPORTS ====================

module.exports = {
  // Joi validation functions
  validateJoi,
  validateJoiBody,
  validateJoiQuery,
  validateJoiParams,
  validateJoiMultiple,
  validateJoiConditional,
  validateFile,
  validateCustom,
  validateRateLimit,
  sanitizeInput,
  sanitizeMiddleware,

  // Express-validator functions (for backward compatibility)
  handleValidationErrors,
  isValidObjectId,
  isStrongPassword,
  isValidPhone,
  isValidPincode,

  // Common Joi patterns for reuse
  commonJoiPatterns,

  // Legacy exports (for backward compatibility)
  validate: validateJoi,
  validateBody: validateJoiBody,
  validateQuery: validateJoiQuery,
  validateParams: validateJoiParams,
  validateMultiple: validateJoiMultiple,
  validateConditional: validateJoiConditional,
};
