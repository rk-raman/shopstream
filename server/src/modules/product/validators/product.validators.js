const {
  validateJoiBody,
  validateJoiQuery,
  validateJoiParams,
  validateFile,
  sanitizeMiddleware,
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

const {
  productCreateSchema,
  productUpdateSchema,
  productSearchSchema,
  productReviewSchema,
  variantCreateSchema,
  variantUpdateSchema,
  bulkProductOperationSchema,
  stockUpdateSchema,
  specificationUpdateSchema,
} = require("./product.schemas");

// ==================== VALIDATION MIDDLEWARE ====================

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
 * Product and Variant ID Validation
 */
const validateProductAndVariantId = [
  validateJoiParams({
    productId: commonJoiPatterns.objectId.required(),
    variantId: commonJoiPatterns.objectId.required(),
  }),
];

/**
 * Product Image Upload Validation
 */
const validateProductImageUpload = [
  validateFile({
    required: true,
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    fieldName: "image",
  }),
];

/**
 * Product Video Upload Validation
 */
const validateProductVideoUpload = [
  validateFile({
    required: true,
    allowedTypes: ["video/mp4", "video/webm", "video/ogg"],
    maxSize: 50 * 1024 * 1024, // 50MB
    fieldName: "video",
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
 * Variant Creation Validation
 */
const validateVariantCreate = [
  sanitizeMiddleware,
  validateJoiBody(variantCreateSchema),
];

/**
 * Variant Update Validation
 */
const validateVariantUpdate = [
  sanitizeMiddleware,
  validateJoiBody(variantUpdateSchema),
];

/**
 * Bulk Product Operations Validation
 */
const validateBulkProductOperation = [
  sanitizeMiddleware,
  validateJoiBody(bulkProductOperationSchema),
];

/**
 * Stock Update Validation
 */
const validateStockUpdate = [
  sanitizeMiddleware,
  validateJoiBody(stockUpdateSchema),
];

/**
 * Specification Management Validation
 */
const validateSpecificationUpdate = [
  sanitizeMiddleware,
  validateJoiBody(specificationUpdateSchema),
];

/**
 * Variant ID Validation
 */
const validateVariantId = [
  validateJoiParams({
    variantId: commonJoiPatterns.objectId.required(),
  }),
];

/**
 * Product Image Delete Validation
 */
const validateProductImageDelete = [
  validateJoiParams({
    productId: commonJoiPatterns.objectId.required(),
    imageId: commonJoiPatterns.objectId.required(),
  }),
];

/**
 * Product Video Delete Validation
 */
const validateProductVideoDelete = [
  validateJoiParams({
    productId: commonJoiPatterns.objectId.required(),
    videoId: commonJoiPatterns.objectId.required(),
  }),
];

/**
 * Product Review ID Validation
 */
const validateProductReviewId = [
  validateJoiParams({
    productId: commonJoiPatterns.objectId.required(),
    reviewId: commonJoiPatterns.objectId.required(),
  }),
];

/**
 * Product Status Update Validation
 */
const validateProductStatusUpdate = [
  sanitizeMiddleware,
  validateJoiBody({
    status: require("joi")
      .string()
      .valid("draft", "active", "inactive", "discontinued")
      .required()
      .messages({
        "any.only":
          "Status must be one of: draft, active, inactive, discontinued",
        "any.required": "Status is required",
      }),
  }),
];

/**
 * Product Feature Toggle Validation
 */
const validateProductFeatureToggle = [
  sanitizeMiddleware,
  validateJoiBody({
    isFeatured: require("joi").boolean().required().messages({
      "any.required": "Featured status is required",
    }),
  }),
];

/**
 * Product Approval Validation
 */
const validateProductApproval = [
  sanitizeMiddleware,
  validateJoiBody({
    isApproved: require("joi").boolean().required().messages({
      "any.required": "Approval status is required",
    }),
    approvalNotes: require("joi").string().max(500).trim().optional().messages({
      "string.max": "Approval notes cannot exceed 500 characters",
    }),
  }),
];

/**
 * Product Duplicate Validation
 */
const validateProductDuplicate = [
  sanitizeMiddleware,
  validateJoiBody({
    newName: require("joi")
      .string()
      .min(2)
      .max(200)
      .trim()
      .optional()
      .messages({
        "string.min": "New product name must be at least 2 characters long",
        "string.max": "New product name cannot exceed 200 characters",
      }),
    duplicateVariants: require("joi").boolean().optional().default(true),
    duplicateImages: require("joi").boolean().optional().default(true),
    duplicateSpecifications: require("joi").boolean().optional().default(true),
  }),
];

/**
 * Product Category Update Validation
 */
const validateProductCategoryUpdate = [
  sanitizeMiddleware,
  validateJoiBody({
    category: commonJoiPatterns.objectId.required().messages({
      "any.required": "Category is required",
    }),
    subcategory: commonJoiPatterns.objectId.optional(),
  }),
];

/**
 * Product Price Update Validation
 */
const validateProductPriceUpdate = [
  sanitizeMiddleware,
  validateJoiBody({
    basePrice: require("joi")
      .number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        "number.positive": "Base price must be a positive number",
      }),
    discountPrice: require("joi")
      .number()
      .positive()
      .precision(2)
      .optional()
      .messages({
        "number.positive": "Discount price must be a positive number",
      }),
    discountPercentage: require("joi")
      .number()
      .min(0)
      .max(100)
      .precision(2)
      .optional()
      .messages({
        "number.min": "Discount percentage cannot be negative",
        "number.max": "Discount percentage cannot exceed 100",
      }),
  }),
];

// ==================== EXPORTS ====================

module.exports = {
  // Main product validators
  validateProductCreate,
  validateProductUpdate,
  validateProductSearch,
  validateProductId,
  validateProductAndVariantId,
  validateProductImageUpload,
  validateProductVideoUpload,
  validateProductReview,

  // Variant validators
  validateVariantCreate,
  validateVariantUpdate,
  validateVariantId,

  // Bulk operations
  validateBulkProductOperation,

  // Additional validators
  validateStockUpdate,
  validateSpecificationUpdate,
  validateProductImageDelete,
  validateProductVideoDelete,
  validateProductReviewId,
  validateProductStatusUpdate,
  validateProductFeatureToggle,
  validateProductApproval,
  validateProductDuplicate,
  validateProductCategoryUpdate,
  validateProductPriceUpdate,
};
