const Joi = require("joi");
const ApiError = require("../../../shared/utils/apiError");
const { HTTP_STATUS } = require("../../../shared/constants/httpStatus");

/**
 * Generic Joi validation middleware factory
 * @param {Object} schema - Joi schema to validate against
 * @param {string} source - Source of data to validate ('body', 'query', 'params')
 * @param {Object} options - Additional validation options
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = "body", options = {}) => {
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
          "VALIDATION_ERROR",
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
 * Validate request body
 * @param {Object} schema - Joi schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateBody = (schema, options = {}) => {
  return validate(schema, "body", options);
};

/**
 * Validate query parameters
 * @param {Object} schema - Joi schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateQuery = (schema, options = {}) => {
  return validate(schema, "query", options);
};

/**
 * Validate route parameters
 * @param {Object} schema - Joi schema
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateParams = (schema, options = {}) => {
  return validate(schema, "params", options);
};

/**
 * Validate multiple sources at once
 * @param {Object} schemas - Object with schema for each source
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateMultiple = (schemas, options = {}) => {
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
          "VALIDATION_ERROR",
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
 * Conditional validation middleware
 * @param {Function} condition - Function that returns true if validation should run
 * @param {Object} schema - Joi schema
 * @param {string} source - Source of data to validate
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware
 */
const validateConditional = (
  condition,
  schema,
  source = "body",
  options = {}
) => {
  return (req, res, next) => {
    if (condition(req)) {
      return validate(schema, source, options)(req, res, next);
    }
    next();
  };
};

/**
 * Async validation middleware for complex validations
 * @param {Function} validator - Async function that performs validation
 * @returns {Function} Express middleware
 */
const validateAsync = (validator) => {
  return async (req, res, next) => {
    try {
      await validator(req, res);
      next();
    } catch (error) {
      next(error);
    }
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
          "FILE_REQUIRED"
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
            "INVALID_FILE_TYPE"
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
            "FILE_TOO_LARGE"
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
 * Custom validation for business logic
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
          "CUSTOM_VALIDATION_ERROR"
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
        "RATE_LIMIT_EXCEEDED"
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
 * Validation error formatter for consistent error responses
 * @param {Error} error - Joi validation error
 * @returns {Object} Formatted error object
 */
const formatValidationError = (error) => {
  if (error.isJoi) {
    return {
      message: "Validation failed",
      errors: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
        type: detail.type,
      })),
    };
  }
  return { message: error.message };
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

module.exports = {
  // Core validation functions
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateMultiple,
  validateConditional,
  validateAsync,
  validateFile,
  validateCustom,
  validateRateLimit,

  // Utility functions
  formatValidationError,
  sanitizeInput,
  sanitizeMiddleware,
};
