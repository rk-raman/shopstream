const {
  validateJoiBody,
  validateJoiQuery,
  validateJoiParams,
  validateFile,
  sanitizeMiddleware,
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

const Joi = require("joi");

// ==================== PRODUCT SCHEMAS ====================

/**
 * Product Creation Schema
 */
const productCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required().messages({
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name cannot exceed 100 characters",
    "string.empty": "Product name is required",
  }),

  description: Joi.string().min(10).max(2000).trim().required().messages({
    "string.min": "Product description must be at least 10 characters long",
    "string.max": "Product description cannot exceed 2000 characters",
    "string.empty": "Product description is required",
  }),

  price: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Price must be a positive number",
    "number.base": "Price must be a valid number",
    "any.required": "Price is required",
  }),

  categoryId: commonJoiPatterns.objectId.required().messages({
    "any.required": "Category ID is required",
  }),

  brandId: commonJoiPatterns.objectId.optional(),

  sku: Joi.string().alphanum().min(3).max(20).uppercase().required().messages({
    "string.alphanum": "SKU must contain only alphanumeric characters",
    "string.min": "SKU must be at least 3 characters long",
    "string.max": "SKU cannot exceed 20 characters",
    "string.empty": "SKU is required",
  }),

  stock: Joi.number().integer().min(0).required().messages({
    "number.integer": "Stock must be a whole number",
    "number.min": "Stock cannot be negative",
    "any.required": "Stock is required",
  }),

  images: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(10)
    .optional()
    .messages({
      "array.min": "At least one product image is required",
      "array.max": "Cannot have more than 10 images",
      "string.uri": "Image must be a valid URL",
    }),

  tags: Joi.array()
    .items(Joi.string().min(2).max(20))
    .max(10)
    .optional()
    .messages({
      "array.max": "Cannot have more than 10 tags",
      "string.min": "Each tag must be at least 2 characters long",
      "string.max": "Each tag cannot exceed 20 characters",
    }),

  specifications: Joi.object()
    .pattern(Joi.string(), Joi.string().min(1).max(100))
    .optional(),

  isActive: Joi.boolean().optional().default(true),
  isFeatured: Joi.boolean().optional().default(false),
});

/**
 * Product Update Schema
 */
const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  description: Joi.string().min(10).max(2000).trim().optional(),
  price: Joi.number().positive().precision(2).optional(),
  categoryId: commonJoiPatterns.objectId.optional(),
  brandId: commonJoiPatterns.objectId.optional(),
  sku: Joi.string().alphanum().min(3).max(20).uppercase().optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10).optional(),
  tags: Joi.array().items(Joi.string().min(2).max(20)).max(10).optional(),
  specifications: Joi.object()
    .pattern(Joi.string(), Joi.string().min(1).max(100))
    .optional(),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Product Search Schema
 */
const productSearchSchema = Joi.object({
  q: Joi.string().min(1).max(100).trim().optional(),
  category: commonJoiPatterns.objectId.optional(),
  brand: commonJoiPatterns.objectId.optional(),
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),
  inStock: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string()
    .valid("name", "price", "createdAt", "rating", "popularity")
    .optional()
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("desc"),
}).concat(commonJoiPatterns.pagination);

/**
 * Product Review Schema
 */
const productReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),

  title: Joi.string().min(5).max(100).trim().required().messages({
    "string.min": "Review title must be at least 5 characters long",
    "string.max": "Review title cannot exceed 100 characters",
    "string.empty": "Review title is required",
  }),

  comment: Joi.string().min(10).max(1000).trim().required().messages({
    "string.min": "Review comment must be at least 10 characters long",
    "string.max": "Review comment cannot exceed 1000 characters",
    "string.empty": "Review comment is required",
  }),

  images: Joi.array().items(Joi.string().uri()).max(5).optional().messages({
    "array.max": "Cannot upload more than 5 review images",
    "string.uri": "Image must be a valid URL",
  }),

  isAnonymous: Joi.boolean().optional().default(false),
});

// ==================== VALIDATORS ====================

/**
 * Product Creation Validation
 */
const validateProductCreate = [
  sanitizeMiddleware,
  validateJoiBody(productCreateSchema),
];

/**
 * Product Update Validation
 */
const validateProductUpdate = [
  sanitizeMiddleware,
  validateJoiBody(productUpdateSchema),
];

/**
 * Product Search Validation
 */
const validateProductSearch = [validateJoiQuery(productSearchSchema)];

/**
 * Product ID Validation
 */
const validateProductId = [
  validateJoiParams({
    productId: commonJoiPatterns.objectId.required(),
  }),
];

/**
 * Product Image Upload Validation
 */
const validateProductImageUpload = [
  validateFile({
    required: true,
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
    fieldName: "image",
  }),
];

/**
 * Product Review Validation
 */
const validateProductReview = [
  sanitizeMiddleware,
  validateJoiBody(productReviewSchema),
];

/**
 * Bulk Product Operations Validation
 */
const validateBulkProductOperation = [
  sanitizeMiddleware,
  validateJoiBody({
    productIds: Joi.array()
      .items(commonJoiPatterns.objectId)
      .min(1)
      .max(100)
      .required()
      .messages({
        "array.min": "At least one product ID is required",
        "array.max": "Cannot process more than 100 products at once",
        "any.required": "Product IDs are required",
      }),
    operation: Joi.string()
      .valid("activate", "deactivate", "delete", "updatePrice", "updateStock")
      .required()
      .messages({
        "any.only":
          "Operation must be one of: activate, deactivate, delete, updatePrice, updateStock",
        "any.required": "Operation is required",
      }),
    data: Joi.object().optional(), // Additional data for specific operations
  }),
];

// ==================== EXPORTS ====================

module.exports = {
  // Product validators
  validateProductCreate,
  validateProductUpdate,
  validateProductSearch,
  validateProductId,
  validateProductImageUpload,
  validateProductReview,
  validateBulkProductOperation,

  // Schemas (for reuse in other modules)
  productCreateSchema,
  productUpdateSchema,
  productSearchSchema,
  productReviewSchema,
};
