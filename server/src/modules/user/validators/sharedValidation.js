const Joi = require("joi");
const mongoose = require("mongoose");

/**
 * Shared validation configuration for User module
 * This eliminates duplication between Joi and Mongoose validations
 */

// ==================== SHARED VALIDATION RULES ====================

const sharedValidation = {
  // Email validation
  email: {
    joi: Joi.string()
      .email({ tlds: { allow: false } })
      .lowercase()
      .trim()
      .messages({
        "string.email": "Please provide a valid email address",
        "string.empty": "Email is required",
      }),
    mongoose: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
  },

  // Password validation
  password: {
    joi: Joi.string()
      .min(8)
      .max(128)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password cannot exceed 128 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)",
        "string.empty": "Password is required",
      }),
    mongoose: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },
      select: false,
    },
  },

  // Name validation
  name: {
    joi: Joi.string()
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
    mongoose: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
  },

  // Phone validation
  phone: {
    joi: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .messages({
        "string.pattern.base":
          "Please enter a valid 10-digit Indian mobile number",
      }),
    mongoose: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
      index: true,
    },
  },

  // Date of birth validation
  dateOfBirth: {
    joi: Joi.date()
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
        "date.max": "Age cannot exceed 120 years",
      }),
    mongoose: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v < new Date();
        },
        message: "Date of birth cannot be in the future",
      },
    },
  },

  // Gender validation
  gender: {
    joi: Joi.string().valid("male", "female", "other").optional().messages({
      "any.only": "Gender must be male, female, or other",
    }),
    mongoose: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
    },
  },

  // Role validation
  role: {
    joi: Joi.string()
      .valid("customer", "seller", "admin")
      .default("customer")
      .messages({
        "any.only": "Role must be customer, seller, or admin",
      }),
    mongoose: {
      type: String,
      enum: {
        values: ["customer", "seller", "admin"],
        message: "Role must be customer, seller, or admin",
      },
      default: "customer",
      index: true,
    },
  },

  // ObjectId validation
  objectId: {
    joi: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          return helpers.error("objectId.base");
        }
        return value;
      })
      .messages({
        "objectId.base": "{{#label}} must be a valid MongoDB ObjectId",
      }),
    mongoose: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid product ID",
      },
    },
  },

  // Pincode validation
  pincode: {
    joi: Joi.string()
      .pattern(/^[1-9][0-9]{5}$/)
      .messages({
        "string.pattern.base":
          "{{#label}} must be a valid 6-digit Indian pincode",
      }),
    mongoose: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"],
    },
  },

  // Marketing consent validation
  marketingConsent: {
    joi: Joi.boolean().optional(),
    mongoose: {
      type: Boolean,
      default: false,
    },
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get Joi validation for a field
 * @param {string} fieldName - Name of the field
 * @param {boolean} required - Whether the field is required
 * @returns {Object} Joi validation object
 */
const getJoiValidation = (fieldName, required = false) => {
  const validation = sharedValidation[fieldName];
  if (!validation) {
    throw new Error(`No shared validation found for field: ${fieldName}`);
  }

  return required ? validation.joi.required() : validation.joi.optional();
};

/**
 * Get Mongoose validation for a field
 * @param {string} fieldName - Name of the field
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mongoose validation object
 */
const getMongooseValidation = (fieldName, overrides = {}) => {
  const validation = sharedValidation[fieldName];
  if (!validation) {
    throw new Error(`No shared validation found for field: ${fieldName}`);
  }

  return { ...validation.mongoose, ...overrides };
};

/**
 * Create a Joi schema from shared validations
 * @param {Object} fieldConfig - Object with field names and their requirements
 * @returns {Object} Joi schema
 */
const createJoiSchema = (fieldConfig) => {
  const schema = {};

  for (const [fieldName, config] of Object.entries(fieldConfig)) {
    if (typeof config === "boolean") {
      schema[fieldName] = getJoiValidation(fieldName, config);
    } else if (typeof config === "object") {
      const validationField = config.field || fieldName;
      schema[fieldName] = getJoiValidation(
        validationField,
        config.required || false
      );
    }
  }

  return Joi.object(schema);
};

/**
 * Create Mongoose schema fields from shared validations
 * @param {Object} fieldConfig - Object with field names and their requirements
 * @returns {Object} Mongoose schema fields
 */
const createMongooseFields = (fieldConfig) => {
  const fields = {};

  for (const [fieldName, config] of Object.entries(fieldConfig)) {
    if (typeof config === "boolean") {
      fields[fieldName] = getMongooseValidation(fieldName, {
        required: config,
      });
    } else if (typeof config === "object") {
      fields[fieldName] = getMongooseValidation(fieldName, config);
    }
  }

  return fields;
};

// ==================== EXPORTS ====================

module.exports = {
  sharedValidation,
  getJoiValidation,
  getMongooseValidation,
  createJoiSchema,
  createMongooseFields,
};
