const Joi = require("joi");
const mongoose = require("mongoose");

// Custom Joi extensions for product-specific validations
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
  type: "sku",
  base: Joi.string(),
  messages: {
    "sku.base":
      "{{#label}} must be a valid SKU format (alphanumeric, 3-20 characters)",
  },
  validate(value, helpers) {
    const skuRegex = /^[A-Z0-9]{3,20}$/;
    if (!skuRegex.test(value)) {
      return { value, errors: helpers.error("sku.base") };
    }
    return { value };
  },
});

const customJoiWithSlug = customJoiExtended.extend({
  type: "slug",
  base: Joi.string(),
  messages: {
    "slug.base":
      "{{#label}} must be a valid slug format (lowercase, hyphens allowed)",
  },
  validate(value, helpers) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(value)) {
      return { value, errors: helpers.error("slug.base") };
    }
    return { value };
  },
});

// Common validation patterns
const commonPatterns = {
  objectId: customJoi.objectId(),
  sku: customJoiExtended.sku(),
  slug: customJoiWithSlug.slug(),
  price: Joi.number().positive().precision(2),
  percentage: Joi.number().min(0).max(100),
  stock: Joi.number().integer().min(0),
  rating: Joi.number().min(1).max(5),
  url: Joi.string().uri(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),
  }),
};

// Product Creation Schema
const productCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).trim().required().messages({
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name cannot exceed 200 characters",
    "string.empty": "Product name is required",
  }),

  slug: commonPatterns.slug.optional(),

  description: Joi.string().min(10).max(2000).trim().required().messages({
    "string.min": "Product description must be at least 10 characters long",
    "string.max": "Product description cannot exceed 2000 characters",
    "string.empty": "Product description is required",
  }),

  shortDescription: Joi.string().max(500).trim().optional().messages({
    "string.max": "Short description cannot exceed 500 characters",
  }),

  category: commonPatterns.objectId.required().messages({
    "any.required": "Category is required",
  }),

  subcategory: commonPatterns.objectId.optional(),

  brand: commonPatterns.objectId.optional(),

  basePrice: commonPatterns.price.required().messages({
    "any.required": "Base price is required",
    "number.positive": "Base price must be a positive number",
  }),

  discountPrice: commonPatterns.price.optional().when("basePrice", {
    is: Joi.exist(),
    then: Joi.number().less(Joi.ref("basePrice")).messages({
      "number.less": "Discount price must be less than base price",
    }),
  }),

  stock: commonPatterns.stock.required().messages({
    "any.required": "Stock quantity is required",
  }),

  sku: commonPatterns.sku.required().messages({
    "any.required": "SKU is required",
  }),

  tags: Joi.array()
    .items(Joi.string().min(2).max(30).trim())
    .max(20)
    .optional()
    .messages({
      "array.max": "Cannot have more than 20 tags",
      "string.min": "Each tag must be at least 2 characters long",
      "string.max": "Each tag cannot exceed 30 characters",
    }),

  images: Joi.array()
    .items(
      Joi.object({
        public_id: Joi.string().optional(),
        url: commonPatterns.url.required(),
        isMain: Joi.boolean().default(false),
      })
    )
    .min(1)
    .max(10)
    .required()
    .messages({
      "array.min": "At least one product image is required",
      "array.max": "Cannot have more than 10 images",
    }),

  videos: Joi.array()
    .items(
      Joi.object({
        public_id: Joi.string().optional(),
        url: commonPatterns.url.required(),
      })
    )
    .max(5)
    .optional()
    .messages({
      "array.max": "Cannot have more than 5 videos",
    }),

  specifications: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(1).max(100).required(),
        value: Joi.string().min(1).max(500).required(),
      })
    )
    .max(50)
    .optional()
    .messages({
      "array.max": "Cannot have more than 50 specifications",
    }),

  variants: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
        price: commonPatterns.price.required(),
        discountPrice: commonPatterns.price.optional(),
        stock: commonPatterns.stock.required(),
        sku: commonPatterns.sku.required(),
        images: Joi.array().items(commonPatterns.url).optional(),
        isActive: Joi.boolean().default(true),
      })
    )
    .optional(),

  hasVariants: Joi.boolean().default(false),

  // SEO fields
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string().max(50)).max(10).optional(),

  // Shipping information
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
  }).optional(),
  shippingClass: Joi.string()
    .valid("standard", "heavy", "fragile", "liquid")
    .default("standard"),

  // Additional fields
  lowStockThreshold: Joi.number().integer().min(0).default(10),
  isDigital: Joi.boolean().default(false),
  downloadableFiles: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        url: commonPatterns.url.required(),
        size: Joi.number().positive().optional(),
      })
    )
    .when("isDigital", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
});

// Product Update Schema
const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).trim().optional(),
  slug: commonPatterns.slug.optional(),
  description: Joi.string().min(10).max(2000).trim().optional(),
  shortDescription: Joi.string().max(500).trim().optional(),
  category: commonPatterns.objectId.optional(),
  subcategory: commonPatterns.objectId.optional(),
  brand: commonPatterns.objectId.optional(),
  basePrice: commonPatterns.price.optional(),
  discountPrice: commonPatterns.price.optional(),
  stock: commonPatterns.stock.optional(),
  sku: commonPatterns.sku.optional(),
  tags: Joi.array()
    .items(Joi.string().min(2).max(30).trim())
    .max(20)
    .optional(),
  images: Joi.array()
    .items(
      Joi.object({
        public_id: Joi.string().optional(),
        url: commonPatterns.url.required(),
        isMain: Joi.boolean().default(false),
      })
    )
    .min(1)
    .max(10)
    .optional(),
  videos: Joi.array()
    .items(
      Joi.object({
        public_id: Joi.string().optional(),
        url: commonPatterns.url.required(),
      })
    )
    .max(5)
    .optional(),
  specifications: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(1).max(100).required(),
        value: Joi.string().min(1).max(500).required(),
      })
    )
    .max(50)
    .optional(),
  status: Joi.string()
    .valid("draft", "active", "inactive", "discontinued")
    .optional(),
  isFeatured: Joi.boolean().optional(),
  metaTitle: Joi.string().max(60).optional(),
  metaDescription: Joi.string().max(160).optional(),
  metaKeywords: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object({
    length: Joi.number().positive().required(),
    width: Joi.number().positive().required(),
    height: Joi.number().positive().required(),
  }).optional(),
  shippingClass: Joi.string()
    .valid("standard", "heavy", "fragile", "liquid")
    .optional(),
  lowStockThreshold: Joi.number().integer().min(0).optional(),
  isDigital: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Product Search Schema
const productSearchSchema = Joi.object({
  search: Joi.string().min(1).max(100).trim().optional(),
  category: commonPatterns.objectId.optional(),
  subcategory: commonPatterns.objectId.optional(),
  brand: commonPatterns.objectId.optional(),
  seller: commonPatterns.objectId.optional(),
  minPrice: commonPatterns.price.optional(),
  maxPrice: commonPatterns.price.optional(),
  inStock: Joi.boolean().optional(),
  status: Joi.string()
    .valid("draft", "active", "inactive", "discontinued")
    .optional(),
  isApproved: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  tags: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),
  sortBy: Joi.string()
    .valid(
      "name",
      "basePrice",
      "createdAt",
      "updatedAt",
      "rating",
      "viewCount",
      "salesCount"
    )
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
});

// Product Variant Schema
const variantSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Variant name is required",
  }),
  value: Joi.string().required().messages({
    "string.empty": "Variant value is required",
  }),
  price: commonPatterns.price.required(),
  discountPrice: commonPatterns.price.optional(),
  stock: commonPatterns.stock.required(),
  sku: commonPatterns.sku.required(),
  images: Joi.array().items(commonPatterns.url).optional(),
  isActive: Joi.boolean().default(true),
});

// Product Review Schema
const productReviewSchema = Joi.object({
  rating: commonPatterns.rating.required().messages({
    "any.required": "Rating is required",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
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

  images: Joi.array().items(commonPatterns.url).max(5).optional().messages({
    "array.max": "Cannot upload more than 5 review images",
  }),

  isAnonymous: Joi.boolean().default(false),

  variantId: commonPatterns.objectId.optional(),
});

// Bulk Operations Schema
const bulkOperationSchema = Joi.object({
  productIds: Joi.array()
    .items(commonPatterns.objectId)
    .min(1)
    .max(100)
    .required()
    .messages({
      "array.min": "At least one product ID is required",
      "array.max": "Cannot process more than 100 products at once",
      "any.required": "Product IDs are required",
    }),

  operation: Joi.string()
    .valid(
      "activate",
      "deactivate",
      "delete",
      "approve",
      "reject",
      "feature",
      "unfeature"
    )
    .required()
    .messages({
      "any.only":
        "Operation must be one of: activate, deactivate, delete, approve, reject, feature, unfeature",
      "any.required": "Operation is required",
    }),

  updateData: Joi.object().optional(),

  reason: Joi.string().max(200).optional().messages({
    "string.max": "Reason cannot exceed 200 characters",
  }),
});

// Stock Update Schema
const stockUpdateSchema = Joi.object({
  stockChange: Joi.number().integer().required().messages({
    "any.required": "Stock change amount is required",
    "number.integer": "Stock change must be a whole number",
  }),

  variantId: commonPatterns.objectId.optional(),

  reason: Joi.string().max(100).optional(),
});

// Product Approval Schema
const productApprovalSchema = Joi.object({
  isApproved: Joi.boolean().required(),

  reason: Joi.string()
    .max(500)
    .when("isApproved", {
      is: false,
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required": "Reason is required when rejecting a product",
      "string.max": "Reason cannot exceed 500 characters",
    }),
});

// Export all schemas
module.exports = {
  // Core product schemas
  productCreateSchema,
  productUpdateSchema,
  productSearchSchema,
  variantSchema,
  productReviewSchema,

  // Operation schemas
  bulkOperationSchema,
  stockUpdateSchema,
  productApprovalSchema,

  // Common patterns for reuse
  commonPatterns,

  // Extended Joi with custom validators
  customJoi: customJoiWithSlug,
};
