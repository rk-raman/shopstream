const Joi = require("joi");
const {
  commonJoiPatterns,
} = require("../../../shared/middleware/validation.middleware");

// ==================== SUB-SCHEMAS ====================

/**
 * Category Attribute Schema
 */
const attributeSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim().required().messages({
    "string.min": "Attribute name must be at least 1 character long",
    "string.max": "Attribute name cannot exceed 100 characters",
    "string.empty": "Attribute name is required",
  }),

  type: Joi.string()
    .valid("text", "number", "select", "multiselect", "boolean")
    .default("text")
    .messages({
      "any.only":
        "Attribute type must be one of: text, number, select, multiselect, boolean",
    }),

  options: Joi.array()
    .items(Joi.string().min(1).max(100).trim())
    .when("type", {
      is: Joi.string().valid("select", "multiselect"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "array.base": "Attribute options must be an array",
      "string.min": "Option must be at least 1 character long",
      "string.max": "Option cannot exceed 100 characters",
    }),

  isRequired: Joi.boolean().default(false),
  isFilterable: Joi.boolean().default(true),
  isSearchable: Joi.boolean().default(false),
});

/**
 * Category Image Schema
 */
const imageSchema = Joi.object({
  public_id: Joi.string().required().messages({
    "string.empty": "Image public_id is required",
  }),
  url: Joi.string().uri().required().messages({
    "string.uri": "Image URL must be a valid URI",
    "string.empty": "Image URL is required",
  }),
});

// ==================== MAIN SCHEMAS ====================

/**
 * Create Category Schema
 */
const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).trim().required().messages({
      "string.min": "Category name must be at least 1 character long",
      "string.max": "Category name cannot exceed 100 characters",
      "string.empty": "Category name is required",
    }),

    slug: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .pattern(/^[a-z0-9-]+$/)
      .optional()
      .messages({
        "string.min": "Slug must be at least 1 character long",
        "string.max": "Slug cannot exceed 100 characters",
        "string.pattern.base":
          "Slug must contain only lowercase letters, numbers, and hyphens",
      }),

    description: Joi.string().max(500).trim().optional().allow("").messages({
      "string.max": "Description cannot exceed 500 characters",
    }),

    shortDescription: Joi.string()
      .max(200)
      .trim()
      .optional()
      .allow("")
      .messages({
        "string.max": "Short description cannot exceed 200 characters",
      }),

    parent: commonJoiPatterns.objectId.optional().allow(null).messages({
      "string.pattern.name": "Parent must be a valid ObjectId",
    }),

    image: imageSchema.optional(),

    icon: Joi.string().max(10).trim().optional().allow("").messages({
      "string.max": "Icon cannot exceed 10 characters",
    }),

    // SEO fields
    metaTitle: Joi.string().max(60).trim().optional().allow("").messages({
      "string.max": "Meta title cannot exceed 60 characters",
    }),

    metaDescription: Joi.string()
      .max(160)
      .trim()
      .optional()
      .allow("")
      .messages({
        "string.max": "Meta description cannot exceed 160 characters",
      }),

    metaKeywords: Joi.array()
      .items(Joi.string().trim().min(1).max(50))
      .max(20)
      .optional()
      .messages({
        "array.max": "Cannot have more than 20 meta keywords",
        "string.min": "Meta keyword must be at least 1 character long",
        "string.max": "Meta keyword cannot exceed 50 characters",
      }),

    // Status fields
    isActive: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false),

    // Sorting
    sortOrder: Joi.number().integer().min(0).default(0).messages({
      "number.integer": "Sort order must be a whole number",
      "number.min": "Sort order cannot be negative",
    }),

    // Attributes
    attributes: Joi.array().items(attributeSchema).max(50).optional().messages({
      "array.max": "Category cannot have more than 50 attributes",
    }),

    // Commission
    commission: Joi.number().min(0).max(100).precision(2).default(0).messages({
      "number.min": "Commission cannot be negative",
      "number.max": "Commission cannot exceed 100%",
      "number.base": "Commission must be a valid number",
    }),
  }),
};

/**
 * Update Category Schema
 */
const updateCategorySchema = {
  params: Joi.object({
    id: commonJoiPatterns.objectId.required().messages({
      "string.pattern.name": "Category ID must be a valid ObjectId",
    }),
  }),

  body: Joi.object({
    name: Joi.string().min(1).max(100).trim().optional().messages({
      "string.min": "Category name must be at least 1 character long",
      "string.max": "Category name cannot exceed 100 characters",
    }),

    slug: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .pattern(/^[a-z0-9-]+$/)
      .optional()
      .messages({
        "string.min": "Slug must be at least 1 character long",
        "string.max": "Slug cannot exceed 100 characters",
        "string.pattern.base":
          "Slug must contain only lowercase letters, numbers, and hyphens",
      }),

    description: Joi.string().max(500).trim().optional().allow("").messages({
      "string.max": "Description cannot exceed 500 characters",
    }),

    shortDescription: Joi.string()
      .max(200)
      .trim()
      .optional()
      .allow("")
      .messages({
        "string.max": "Short description cannot exceed 200 characters",
      }),

    parent: commonJoiPatterns.objectId.optional().allow(null).messages({
      "string.pattern.name": "Parent must be a valid ObjectId",
    }),

    image: imageSchema.optional().allow(null),

    icon: Joi.string().max(10).trim().optional().allow("").messages({
      "string.max": "Icon cannot exceed 10 characters",
    }),

    // SEO fields
    metaTitle: Joi.string().max(60).trim().optional().allow("").messages({
      "string.max": "Meta title cannot exceed 60 characters",
    }),

    metaDescription: Joi.string()
      .max(160)
      .trim()
      .optional()
      .allow("")
      .messages({
        "string.max": "Meta description cannot exceed 160 characters",
      }),

    metaKeywords: Joi.array()
      .items(Joi.string().trim().min(1).max(50))
      .max(20)
      .optional()
      .messages({
        "array.max": "Cannot have more than 20 meta keywords",
        "string.min": "Meta keyword must be at least 1 character long",
        "string.max": "Meta keyword cannot exceed 50 characters",
      }),

    // Status fields
    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),

    // Sorting
    sortOrder: Joi.number().integer().min(0).optional().messages({
      "number.integer": "Sort order must be a whole number",
      "number.min": "Sort order cannot be negative",
    }),

    // Attributes
    attributes: Joi.array().items(attributeSchema).max(50).optional().messages({
      "array.max": "Category cannot have more than 50 attributes",
    }),

    // Commission
    commission: Joi.number().min(0).max(100).precision(2).optional().messages({
      "number.min": "Commission cannot be negative",
      "number.max": "Commission cannot exceed 100%",
      "number.base": "Commission must be a valid number",
    }),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

/**
 * Get Category by ID Schema
 */
const getCategoryByIdSchema = {
  params: Joi.object({
    id: commonJoiPatterns.objectId.required().messages({
      "string.pattern.name": "Category ID must be a valid ObjectId",
    }),
  }),

  query: Joi.object({
    populate: Joi.boolean().default(true),
  }),
};

/**
 * Get Category by Slug Schema
 */
const getCategoryBySlugSchema = {
  params: Joi.object({
    slug: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .pattern(/^[a-z0-9-]+$/)
      .required()
      .messages({
        "string.min": "Slug must be at least 1 character long",
        "string.max": "Slug cannot exceed 100 characters",
        "string.pattern.base":
          "Slug must contain only lowercase letters, numbers, and hyphens",
        "string.empty": "Slug is required",
      }),
  }),

  query: Joi.object({
    populate: Joi.boolean().default(true),
  }),
};

/**
 * Get Categories Schema (with filters and pagination)
 */
const getCategoriesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.integer": "Page must be a whole number",
      "number.min": "Page must be at least 1",
    }),

    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      "number.integer": "Limit must be a whole number",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),

    search: Joi.string().trim().min(1).max(100).optional().messages({
      "string.min": "Search term must be at least 1 character long",
      "string.max": "Search term cannot exceed 100 characters",
    }),

    parent: Joi.alternatives()
      .try(commonJoiPatterns.objectId, Joi.string().valid("null"))
      .optional()
      .messages({
        "string.pattern.name": "Parent must be a valid ObjectId or 'null'",
      }),

    level: Joi.number().integer().min(0).max(3).optional().messages({
      "number.integer": "Level must be a whole number",
      "number.min": "Level cannot be negative",
      "number.max": "Level cannot exceed 3",
    }),

    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),

    sortBy: Joi.string()
      .valid(
        "name",
        "createdAt",
        "updatedAt",
        "sortOrder",
        "productCount",
        "level"
      )
      .default("sortOrder")
      .messages({
        "any.only":
          "Sort by must be one of: name, createdAt, updatedAt, sortOrder, productCount, level",
      }),

    sortOrder: Joi.string().valid("asc", "desc").default("asc").messages({
      "any.only": "Sort order must be either 'asc' or 'desc'",
    }),

    populate: Joi.boolean().default(false),
  }),
};

/**
 * Delete Category Schema
 */
const deleteCategorySchema = {
  params: Joi.object({
    id: commonJoiPatterns.objectId.required().messages({
      "string.pattern.name": "Category ID must be a valid ObjectId",
    }),
  }),
};

/**
 * Search Categories Schema
 */
const searchCategoriesSchema = {
  query: Joi.object({
    q: Joi.string().trim().min(1).max(100).required().messages({
      "string.min": "Search query must be at least 1 character long",
      "string.max": "Search query cannot exceed 100 characters",
      "string.empty": "Search query is required",
    }),

    limit: Joi.number().integer().min(1).max(50).default(20).messages({
      "number.integer": "Limit must be a whole number",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 50",
    }),

    includeInactive: Joi.boolean().default(false),
  }),
};

/**
 * Update Category Sort Order Schema
 */
const updateCategorySortOrderSchema = {
  params: Joi.object({
    id: commonJoiPatterns.objectId.required().messages({
      "string.pattern.name": "Category ID must be a valid ObjectId",
    }),
  }),

  body: Joi.object({
    sortOrder: Joi.number().integer().min(0).required().messages({
      "number.integer": "Sort order must be a whole number",
      "number.min": "Sort order cannot be negative",
      "any.required": "Sort order is required",
    }),
  }),
};

/**
 * Bulk Update Categories Schema
 */
const bulkUpdateCategoriesSchema = {
  body: Joi.object({
    categoryIds: Joi.array()
      .items(commonJoiPatterns.objectId)
      .min(1)
      .max(100)
      .required()
      .messages({
        "array.min": "At least one category ID is required",
        "array.max": "Cannot update more than 100 categories at once",
        "string.pattern.name": "Each category ID must be a valid ObjectId",
      }),

    updateData: Joi.object({
      isActive: Joi.boolean().optional(),
      isFeatured: Joi.boolean().optional(),
      commission: Joi.number()
        .min(0)
        .max(100)
        .precision(2)
        .optional()
        .messages({
          "number.min": "Commission cannot be negative",
          "number.max": "Commission cannot exceed 100%",
        }),
      sortOrder: Joi.number().integer().min(0).optional().messages({
        "number.integer": "Sort order must be a whole number",
        "number.min": "Sort order cannot be negative",
      }),
    })
      .min(1)
      .required()
      .messages({
        "object.min": "At least one field must be provided for update",
      }),
  }),
};

/**
 * Get Categories by Level Schema
 */
const getCategoriesByLevelSchema = {
  params: Joi.object({
    level: Joi.number().integer().min(0).max(3).required().messages({
      "number.integer": "Level must be a whole number",
      "number.min": "Level cannot be negative",
      "number.max": "Level cannot exceed 3",
      "any.required": "Level is required",
    }),
  }),

  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).messages({
      "number.integer": "Limit must be a whole number",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),

    isActive: Joi.boolean().default(true),
  }),
};

/**
 * Get Featured Categories Schema
 */
const getFeaturedCategoriesSchema = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(10).messages({
      "number.integer": "Limit must be a whole number",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 50",
    }),
  }),
};

/**
 * Get Category Tree Schema
 */
const getCategoryTreeSchema = {
  query: Joi.object({
    includeInactive: Joi.boolean().default(false),
  }),
};

/**
 * Upload Category Image Schema
 */
const uploadCategoryImageSchema = {
  params: Joi.object({
    id: commonJoiPatterns.objectId.required().messages({
      "string.pattern.name": "Category ID must be a valid ObjectId",
    }),
  }),
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  getCategoryBySlugSchema,
  getCategoriesSchema,
  deleteCategorySchema,
  searchCategoriesSchema,
  updateCategorySortOrderSchema,
  bulkUpdateCategoriesSchema,
  getCategoriesByLevelSchema,
  getFeaturedCategoriesSchema,
  getCategoryTreeSchema,
  uploadCategoryImageSchema,
};
