const Joi = require("joi");
const {
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

// ==================== SUB-SCHEMAS ====================

/**
 * Product Variant Schema
 */
const variantSchema = Joi.object({
  name: Joi.string().min(1).max(50).trim().required().messages({
    "string.min": "Variant name must be at least 1 character long",
    "string.max": "Variant name cannot exceed 50 characters",
    "string.empty": "Variant name is required",
  }),

  value: Joi.string().min(1).max(100).trim().required().messages({
    "string.min": "Variant value must be at least 1 character long",
    "string.max": "Variant value cannot exceed 100 characters",
    "string.empty": "Variant value is required",
  }),

  price: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Variant price must be a positive number",
    "number.base": "Variant price must be a valid number",
    "any.required": "Variant price is required",
  }),

  discountPrice: Joi.number().positive().precision(2).optional().messages({
    "number.positive": "Variant discount price must be a positive number",
    "number.base": "Variant discount price must be a valid number",
  }),

  stock: Joi.number().integer().min(0).required().messages({
    "number.integer": "Variant stock must be a whole number",
    "number.min": "Variant stock cannot be negative",
    "any.required": "Variant stock is required",
  }),

  sku: Joi.string().min(3).max(50).trim().required().messages({
    "string.min": "Variant SKU must be at least 3 characters long",
    "string.max": "Variant SKU cannot exceed 50 characters",
    "string.empty": "Variant SKU is required",
  }),

  images: Joi.array().items(Joi.string().uri()).max(10).optional().messages({
    "array.max": "Variant cannot have more than 10 images",
    "string.uri": "Variant image must be a valid URL",
  }),

  isActive: Joi.boolean().optional().default(true),
});

/**
 * Product Specification Schema
 */
const specificationSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required().messages({
    "string.min": "Specification name must be at least 1 character long",
    "string.max": "Specification name cannot exceed 100 characters",
    "string.empty": "Specification name is required",
  }),

  value: Joi.string().min(1).max(500).trim().required().messages({
    "string.min": "Specification value must be at least 1 character long",
    "string.max": "Specification value cannot exceed 500 characters",
    "string.empty": "Specification value is required",
  }),
});

/**
 * Product Image Schema
 */
const imageSchema = Joi.object({
  public_id: Joi.string().optional(),
  url: Joi.string().uri().required().messages({
    "string.uri": "Image URL must be a valid URL",
    "any.required": "Image URL is required",
  }),
  isMain: Joi.boolean().optional().default(false),
});

/**
 * Product Video Schema
 */
const videoSchema = Joi.object({
  public_id: Joi.string().optional(),
  url: Joi.string().uri().required().messages({
    "string.uri": "Video URL must be a valid URL",
    "any.required": "Video URL is required",
  }),
});

/**
 * Product Dimensions Schema
 */
const dimensionsSchema = Joi.object({
  length: Joi.number().positive().precision(2).optional().messages({
    "number.positive": "Length must be a positive number",
  }),
  width: Joi.number().positive().precision(2).optional().messages({
    "number.positive": "Width must be a positive number",
  }),
  height: Joi.number().positive().precision(2).optional().messages({
    "number.positive": "Height must be a positive number",
  }),
});

/**
 * Downloadable File Schema
 */
const downloadableFileSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required().messages({
    "string.min": "File name must be at least 1 character long",
    "string.max": "File name cannot exceed 100 characters",
    "string.empty": "File name is required",
  }),
  url: Joi.string().uri().required().messages({
    "string.uri": "File URL must be a valid URL",
    "any.required": "File URL is required",
  }),
  size: Joi.number().positive().integer().optional().messages({
    "number.positive": "File size must be a positive number",
    "number.integer": "File size must be a whole number",
  }),
});

// ==================== MAIN PRODUCT SCHEMAS ====================

/**
 * Comprehensive Product Creation Schema
 */
const productCreateSchema = Joi.object({
  // Basic Information
  name: Joi.string().min(2).max(200).trim().required().messages({
    "string.min": "Product name must be at least 2 characters long",
    "string.max": "Product name cannot exceed 200 characters",
    "string.empty": "Product name is required",
  }),

  slug: Joi.string().min(2).max(200).lowercase().trim().optional().messages({
    "string.min": "Product slug must be at least 2 characters long",
    "string.max": "Product slug cannot exceed 200 characters",
  }),

  description: Joi.string().min(10).max(2000).trim().required().messages({
    "string.min": "Product description must be at least 10 characters long",
    "string.max": "Product description cannot exceed 2000 characters",
    "string.empty": "Product description is required",
  }),

  shortDescription: Joi.string().max(500).trim().optional().messages({
    "string.max": "Short description cannot exceed 500 characters",
  }),

  // Categorization
  category: commonJoiPatterns.objectId.required().messages({
    "any.required": "Category is required",
  }),

  subcategory: commonJoiPatterns.objectId.optional(),

  brand: commonJoiPatterns.objectId.optional(),

  tags: Joi.array()
    .items(Joi.string().min(2).max(50).trim())
    .max(20)
    .optional()
    .messages({
      "array.max": "Cannot have more than 20 tags",
      "string.min": "Each tag must be at least 2 characters long",
      "string.max": "Each tag cannot exceed 50 characters",
    }),

  // Pricing
  basePrice: Joi.number().positive().precision(2).required().messages({
    "number.positive": "Base price must be a positive number",
    "number.base": "Base price must be a valid number",
    "any.required": "Base price is required",
  }),

  discountPrice: Joi.number().positive().precision(2).optional().messages({
    "number.positive": "Discount price must be a positive number",
    "number.base": "Discount price must be a valid number",
  }),

  discountPercentage: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .optional()
    .messages({
      "number.min": "Discount percentage cannot be negative",
      "number.max": "Discount percentage cannot exceed 100",
    }),

  // Media
  images: Joi.array()
    .items(Joi.alternatives().try(imageSchema, Joi.string().uri()))
    .min(1)
    .max(20)
    .optional()
    .messages({
      "array.min": "At least one product image is required",
      "array.max": "Cannot have more than 20 images",
    }),

  videos: Joi.array()
    .items(Joi.alternatives().try(videoSchema, Joi.string().uri()))
    .max(5)
    .optional()
    .messages({
      "array.max": "Cannot have more than 5 videos",
    }),

  // Inventory (for simple products)
  stock: Joi.number().integer().min(0).optional().default(0).messages({
    "number.integer": "Stock must be a whole number",
    "number.min": "Stock cannot be negative",
  }),

  sku: Joi.string().min(3).max(50).trim().optional().messages({
    "string.min": "SKU must be at least 3 characters long",
    "string.max": "SKU cannot exceed 50 characters",
  }),

  // Variants (for complex products)
  variants: Joi.array().items(variantSchema).max(100).optional().messages({
    "array.max": "Cannot have more than 100 variants",
  }),

  hasVariants: Joi.boolean().optional().default(false),

  // Specifications
  specifications: Joi.array()
    .items(specificationSchema)
    .max(50)
    .optional()
    .messages({
      "array.max": "Cannot have more than 50 specifications",
    }),

  // Seller Information
  seller: commonJoiPatterns.objectId.optional(),

  // Status
  status: Joi.string()
    .valid("draft", "active", "inactive", "discontinued")
    .optional()
    .default("draft")
    .messages({
      "any.only":
        "Status must be one of: draft, active, inactive, discontinued",
    }),

  isApproved: Joi.boolean().optional().default(false),
  isFeatured: Joi.boolean().optional().default(false),

  // SEO
  metaTitle: Joi.string().max(60).trim().optional().messages({
    "string.max": "Meta title cannot exceed 60 characters",
  }),

  metaDescription: Joi.string().max(160).trim().optional().messages({
    "string.max": "Meta description cannot exceed 160 characters",
  }),

  metaKeywords: Joi.array()
    .items(Joi.string().min(2).max(50).trim())
    .max(10)
    .optional()
    .messages({
      "array.max": "Cannot have more than 10 meta keywords",
      "string.min": "Each meta keyword must be at least 2 characters long",
      "string.max": "Each meta keyword cannot exceed 50 characters",
    }),

  // Analytics (usually set by system, but can be initialized)
  viewCount: Joi.number().integer().min(0).optional().default(0),
  salesCount: Joi.number().integer().min(0).optional().default(0),
  wishlistCount: Joi.number().integer().min(0).optional().default(0),

  // Shipping
  weight: Joi.number().positive().precision(2).optional().messages({
    "number.positive": "Weight must be a positive number (in grams)",
  }),

  dimensions: dimensionsSchema.optional(),

  shippingClass: Joi.string()
    .valid("standard", "heavy", "fragile", "liquid")
    .optional()
    .default("standard")
    .messages({
      "any.only":
        "Shipping class must be one of: standard, heavy, fragile, liquid",
    }),

  // Additional fields
  lowStockThreshold: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(10)
    .messages({
      "number.integer": "Low stock threshold must be a whole number",
      "number.min": "Low stock threshold cannot be negative",
    }),

  isDigital: Joi.boolean().optional().default(false),

  downloadableFiles: Joi.array()
    .items(downloadableFileSchema)
    .max(10)
    .optional()
    .messages({
      "array.max": "Cannot have more than 10 downloadable files",
    }),
});

/**
 * Product Update Schema
 */
const productUpdateSchema = Joi.object({
  // Basic Information
  name: Joi.string().min(2).max(200).trim().optional(),
  slug: Joi.string().min(2).max(200).lowercase().trim().optional(),
  description: Joi.string().min(10).max(2000).trim().optional(),
  shortDescription: Joi.string().max(500).trim().optional(),

  // Categorization
  category: commonJoiPatterns.objectId.optional(),
  subcategory: commonJoiPatterns.objectId.optional(),
  brand: commonJoiPatterns.objectId.optional(),
  tags: Joi.array()
    .items(Joi.string().min(2).max(50).trim())
    .max(20)
    .optional(),

  // Pricing
  basePrice: Joi.number().positive().precision(2).optional(),
  discountPrice: Joi.number().positive().precision(2).optional(),
  discountPercentage: Joi.number().min(0).max(100).precision(2).optional(),

  // Media
  images: Joi.array()
    .items(Joi.alternatives().try(imageSchema, Joi.string().uri()))
    .min(1)
    .max(20)
    .optional(),
  videos: Joi.array()
    .items(Joi.alternatives().try(videoSchema, Joi.string().uri()))
    .max(5)
    .optional(),

  // Inventory
  stock: Joi.number().integer().min(0).optional(),
  sku: Joi.string().min(3).max(50).trim().optional(),

  // Variants
  variants: Joi.array().items(variantSchema).max(100).optional(),
  hasVariants: Joi.boolean().optional(),

  // Specifications
  specifications: Joi.array().items(specificationSchema).max(50).optional(),

  // Status
  status: Joi.string()
    .valid("draft", "active", "inactive", "discontinued")
    .optional(),
  isApproved: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),

  // SEO
  metaTitle: Joi.string().max(60).trim().optional(),
  metaDescription: Joi.string().max(160).trim().optional(),
  metaKeywords: Joi.array()
    .items(Joi.string().min(2).max(50).trim())
    .max(10)
    .optional(),

  // Analytics
  viewCount: Joi.number().integer().min(0).optional(),
  salesCount: Joi.number().integer().min(0).optional(),
  wishlistCount: Joi.number().integer().min(0).optional(),

  // Shipping
  weight: Joi.number().positive().precision(2).optional(),
  dimensions: dimensionsSchema.optional(),
  shippingClass: Joi.string()
    .valid("standard", "heavy", "fragile", "liquid")
    .optional(),

  // Additional fields
  lowStockThreshold: Joi.number().integer().min(0).optional(),
  isDigital: Joi.boolean().optional(),
  downloadableFiles: Joi.array()
    .items(downloadableFileSchema)
    .max(10)
    .optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Enhanced Product Search Schema
 */
const productSearchSchema = Joi.object({
  // Basic search
  q: Joi.string().min(1).max(100).trim().optional(),

  // Filters
  category: commonJoiPatterns.objectId.optional(),
  subcategory: commonJoiPatterns.objectId.optional(),
  brand: commonJoiPatterns.objectId.optional(),
  seller: commonJoiPatterns.objectId.optional(),

  // Price filters
  minPrice: Joi.number().positive().optional(),
  maxPrice: Joi.number().positive().optional(),

  // Status filters
  status: Joi.string()
    .valid("draft", "active", "inactive", "discontinued")
    .optional(),
  isApproved: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  inStock: Joi.boolean().optional(),

  // Product type filters
  hasVariants: Joi.boolean().optional(),
  isDigital: Joi.boolean().optional(),
  shippingClass: Joi.string()
    .valid("standard", "heavy", "fragile", "liquid")
    .optional(),

  // Rating filter
  minRating: Joi.number().min(0).max(5).optional(),

  // Tags filter
  tags: Joi.alternatives()
    .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
    .optional(),

  // Sorting
  sortBy: Joi.string()
    .valid(
      "name",
      "basePrice",
      "createdAt",
      "updatedAt",
      "rating.average",
      "viewCount",
      "salesCount",
      "wishlistCount"
    )
    .optional()
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").optional().default("desc"),

  // Pagination
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(12),
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

  // Variant-specific review (if reviewing a specific variant)
  variantId: commonJoiPatterns.objectId.optional(),
});

/**
 * Variant Management Schemas
 */
const variantCreateSchema = variantSchema;

const variantUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(50).trim().optional(),
  value: Joi.string().min(1).max(100).trim().optional(),
  price: Joi.number().positive().precision(2).optional(),
  discountPrice: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).optional(),
  sku: Joi.string().min(3).max(50).trim().optional(),
  images: Joi.array().items(Joi.string().uri()).max(10).optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for variant update",
  });

/**
 * Bulk Operations Schema
 */
const bulkProductOperationSchema = Joi.object({
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
    .valid(
      "activate",
      "deactivate",
      "delete",
      "updatePrice",
      "updateStock",
      "updateStatus",
      "updateShippingClass",
      "feature",
      "unfeature"
    )
    .required()
    .messages({
      "any.only": "Invalid operation specified",
      "any.required": "Operation is required",
    }),

  data: Joi.object({
    // For price updates
    priceMultiplier: Joi.number().positive().optional(),
    discountPercentage: Joi.number().min(0).max(100).optional(),

    // For stock updates
    stockAdjustment: Joi.number().integer().optional(),

    // For status updates
    status: Joi.string()
      .valid("draft", "active", "inactive", "discontinued")
      .optional(),

    // For shipping class updates
    shippingClass: Joi.string()
      .valid("standard", "heavy", "fragile", "liquid")
      .optional(),
  }).optional(),
});

/**
 * Stock Update Schema
 */
const stockUpdateSchema = Joi.object({
  quantity: Joi.number().integer().required().messages({
    "number.integer": "Quantity must be a whole number",
    "any.required": "Quantity is required",
  }),
  variantId: commonJoiPatterns.objectId.optional(),
  operation: Joi.string()
    .valid("set", "add", "subtract")
    .optional()
    .default("set"),
});

/**
 * Specification Update Schema
 */
const specificationUpdateSchema = Joi.object({
  specifications: Joi.array()
    .items(specificationSchema)
    .max(50)
    .required()
    .messages({
      "array.max": "Cannot have more than 50 specifications",
      "any.required": "Specifications array is required",
    }),
});

/**
 * Bulk Product Create/Update Schema
 */
const bulkProductCreateUpdateSchema = Joi.object({
  operations: Joi.array()
    .items(
      Joi.object({
        operation: Joi.string().valid("create", "update").required().messages({
          "any.only": "Operation must be either 'create' or 'update'",
          "any.required": "Operation type is required",
        }),

        productId: Joi.when("operation", {
          is: "update",
          then: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional(),
          otherwise: Joi.forbidden(),
        }),

        sku: Joi.string().min(3).max(50).trim().optional(),

        data: Joi.object({
          name: Joi.string().min(2).max(200).trim(),
          slug: Joi.string().min(2).max(200).lowercase().trim().optional(),
          description: Joi.string().min(10).max(2000).trim(),
          shortDescription: Joi.string().max(500).trim().optional(),
          category: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
          subcategory: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional(),
          brand: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional(),
          basePrice: Joi.number().positive().precision(2),
          discountPrice: Joi.number().positive().precision(2).optional(),
          discountPercentage: Joi.number()
            .min(0)
            .max(100)
            .precision(2)
            .optional(),
          stock: Joi.number().integer().min(0).optional(),
          sku: Joi.string().min(3).max(50).trim().optional(),
          tags: Joi.array()
            .items(Joi.string().min(2).max(50).trim())
            .max(20)
            .optional(),
          images: Joi.array()
            .items(
              Joi.alternatives().try(
                Joi.object({
                  public_id: Joi.string().optional(),
                  url: Joi.string().uri().required(),
                  isMain: Joi.boolean().optional(),
                }),
                Joi.string().uri()
              )
            )
            .max(20)
            .optional(),
          videos: Joi.array()
            .items(
              Joi.alternatives().try(
                Joi.object({
                  public_id: Joi.string().optional(),
                  url: Joi.string().uri().required(),
                }),
                Joi.string().uri()
              )
            )
            .max(5)
            .optional(),
          variants: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().min(1).max(50).trim().required(),
                value: Joi.string().min(1).max(100).trim().required(),
                price: Joi.number().positive().precision(2).required(),
                discountPrice: Joi.number().positive().precision(2).optional(),
                stock: Joi.number().integer().min(0).required(),
                sku: Joi.string().min(3).max(50).trim().required(),
                images: Joi.array()
                  .items(Joi.string().uri())
                  .max(10)
                  .optional(),
                isActive: Joi.boolean().optional(),
              })
            )
            .max(100)
            .optional(),
          hasVariants: Joi.boolean().optional(),
          specifications: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().min(1).max(100).trim().required(),
                value: Joi.string().min(1).max(500).trim().required(),
              })
            )
            .max(50)
            .optional(),
          status: Joi.string()
            .valid("draft", "active", "inactive", "discontinued")
            .optional(),
          isApproved: Joi.boolean().optional(),
          isFeatured: Joi.boolean().optional(),
          metaTitle: Joi.string().max(60).trim().optional(),
          metaDescription: Joi.string().max(160).trim().optional(),
          metaKeywords: Joi.array()
            .items(Joi.string().min(2).max(50).trim())
            .max(10)
            .optional(),
          weight: Joi.number().positive().precision(2).optional(),
          dimensions: Joi.object({
            length: Joi.number().positive().precision(2).optional(),
            width: Joi.number().positive().precision(2).optional(),
            height: Joi.number().positive().precision(2).optional(),
          }).optional(),
          shippingClass: Joi.string()
            .valid("standard", "heavy", "fragile", "liquid")
            .optional(),
          lowStockThreshold: Joi.number().integer().min(0).optional(),
          isDigital: Joi.boolean().optional(),
          downloadableFiles: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().min(1).max(100).trim().required(),
                url: Joi.string().uri().required(),
                size: Joi.number().positive().integer().optional(),
              })
            )
            .max(10)
            .optional(),
        }).required(),
      })
    )
    .min(1)
    .max(500)
    .required()
    .messages({
      "array.min": "At least one operation is required",
      "array.max": "Cannot process more than 500 products at once",
      "any.required": "Operations array is required",
    }),

  options: Joi.object({
    stopOnError: Joi.boolean().default(false),
    validateOnly: Joi.boolean().default(false),
    skipDuplicates: Joi.boolean().default(true),
    updateExisting: Joi.boolean().default(false),
  }).optional(),
});

// ==================== EXPORTS ====================

module.exports = {
  // Main product schemas
  productCreateSchema,
  productUpdateSchema,
  productSearchSchema,
  productReviewSchema,
  bulkProductCreateUpdateSchema,

  // Variant schemas
  variantCreateSchema,
  variantUpdateSchema,

  // Operation schemas
  bulkProductOperationSchema,
  stockUpdateSchema,
  specificationUpdateSchema,

  // Sub-schemas
  variantSchema,
  specificationSchema,
  imageSchema,
  videoSchema,
  dimensionsSchema,
  downloadableFileSchema,
};
