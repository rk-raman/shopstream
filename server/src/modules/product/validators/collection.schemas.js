const Joi = require("joi");

// Common schemas
const mongoIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid MongoDB ObjectId");

const seoSchema = Joi.object({
  title: Joi.string().max(60).trim().allow(""),
  description: Joi.string().max(160).trim().allow(""),
  keywords: Joi.array().items(Joi.string().max(50).trim()).max(10),
});

const imageSchema = Joi.object({
  public_id: Joi.string().allow(null, ""),
  url: Joi.string().uri().allow(null, ""),
});

const ruleConditionSchema = Joi.object({
  field: Joi.string()
    .valid(
      "title",
      "type",
      "vendor",
      "price",
      "weight",
      "tag",
      "category",
      "brand"
    )
    .required(),
  relation: Joi.string()
    .valid(
      "equals",
      "not_equals",
      "starts_with",
      "ends_with",
      "contains",
      "not_contains",
      "greater_than",
      "less_than"
    )
    .required(),
  value: Joi.string().required(),
});

const rulesSchema = Joi.object({
  conditions: Joi.array().items(ruleConditionSchema).min(1).max(10),
  match: Joi.string().valid("all", "any").default("all"),
});

// Create collection schema
const createCollectionSchema = {
  body: Joi.object({
    name: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Collection name is required",
      "string.min": "Collection name must be at least 1 character long",
      "string.max": "Collection name cannot exceed 100 characters",
    }),

    handle: Joi.string()
      .max(100)
      .trim()
      .lowercase()
      .regex(/^[a-z0-9-]+$/)
      .messages({
        "string.pattern.base":
          "Handle can only contain lowercase letters, numbers, and hyphens",
        "string.max": "Handle cannot exceed 100 characters",
      }),

    description: Joi.string().max(1000).trim().allow("").messages({
      "string.max": "Description cannot exceed 1000 characters",
    }),

    type: Joi.string().valid("manual", "automated").default("manual").messages({
      "any.only": "Collection type must be either 'manual' or 'automated'",
    }),

    rules: Joi.when("type", {
      is: "automated",
      then: rulesSchema.required(),
      otherwise: rulesSchema.optional(),
    }),

    products: Joi.when("type", {
      is: "manual",
      then: Joi.array().items(mongoIdSchema).max(1000),
      otherwise: Joi.forbidden(),
    }),

    image: imageSchema,

    seo: seoSchema,

    isVisible: Joi.boolean().default(true),

    isPublished: Joi.boolean().default(false),

    sortOrder: Joi.string()
      .valid(
        "manual",
        "best-selling",
        "created-desc",
        "created-asc",
        "price-desc",
        "price-asc",
        "alphabetical-asc",
        "alphabetical-desc"
      )
      .default("manual")
      .messages({
        "any.only": "Invalid sort order option",
      }),
  }).required(),
};

// Update collection schema
const updateCollectionSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),

  body: Joi.object({
    name: Joi.string().min(1).max(100).trim().messages({
      "string.empty": "Collection name cannot be empty",
      "string.min": "Collection name must be at least 1 character long",
      "string.max": "Collection name cannot exceed 100 characters",
    }),

    handle: Joi.string()
      .max(100)
      .trim()
      .lowercase()
      .regex(/^[a-z0-9-]+$/)
      .messages({
        "string.pattern.base":
          "Handle can only contain lowercase letters, numbers, and hyphens",
        "string.max": "Handle cannot exceed 100 characters",
      }),

    description: Joi.string().max(1000).trim().allow("").messages({
      "string.max": "Description cannot exceed 1000 characters",
    }),

    type: Joi.string().valid("manual", "automated").messages({
      "any.only": "Collection type must be either 'manual' or 'automated'",
    }),

    rules: rulesSchema,

    products: Joi.array().items(mongoIdSchema).max(1000),

    image: imageSchema,

    seo: seoSchema,

    isVisible: Joi.boolean(),

    isPublished: Joi.boolean(),

    sortOrder: Joi.string()
      .valid(
        "manual",
        "best-selling",
        "created-desc",
        "created-asc",
        "price-desc",
        "price-asc",
        "alphabetical-asc",
        "alphabetical-desc"
      )
      .messages({
        "any.only": "Invalid sort order option",
      }),
  })
    .min(1)
    .required(),
};

// Get collection by ID schema
const getCollectionByIdSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),

  query: Joi.object({
    includeProducts: Joi.boolean().default(false),
  }),
};

// Get collection by handle schema
const getCollectionByHandleSchema = {
  params: Joi.object({
    handle: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Collection handle is required",
      "string.max": "Handle cannot exceed 100 characters",
    }),
  }).required(),

  query: Joi.object({
    includeProducts: Joi.boolean().default(false),
  }),
};

// Get collections schema
const getCollectionsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("createdAt", "updatedAt", "name", "productCount", "viewCount")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    sellerId: mongoIdSchema,
    type: Joi.string().valid("manual", "automated"),
    isVisible: Joi.boolean(),
    isPublished: Joi.boolean(),
    search: Joi.string().max(100).trim(),
    includeHidden: Joi.boolean().default(false),
    includeUnpublished: Joi.boolean().default(false),
  }),
};

// Delete collection schema
const deleteCollectionSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),
};

// Search collections schema
const searchCollectionsSchema = {
  query: Joi.object({
    q: Joi.string().min(1).max(100).trim().required().messages({
      "string.empty": "Search query is required",
      "string.min": "Search query must be at least 1 character long",
      "string.max": "Search query cannot exceed 100 characters",
    }),
    limit: Joi.number().integer().min(1).max(50).default(20),
    sellerId: mongoIdSchema,
  }).required(),
};

// Add products to collection schema
const addProductsToCollectionSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),

  body: Joi.object({
    productIds: Joi.array()
      .items(mongoIdSchema)
      .min(1)
      .max(100)
      .unique()
      .required()
      .messages({
        "array.min": "At least one product ID is required",
        "array.max": "Cannot add more than 100 products at once",
        "array.unique": "Duplicate product IDs are not allowed",
      }),
  }).required(),
};

// Remove products from collection schema
const removeProductsFromCollectionSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),

  body: Joi.object({
    productIds: Joi.array()
      .items(mongoIdSchema)
      .min(1)
      .max(100)
      .unique()
      .required()
      .messages({
        "array.min": "At least one product ID is required",
        "array.max": "Cannot remove more than 100 products at once",
        "array.unique": "Duplicate product IDs are not allowed",
      }),
  }).required(),
};

// Get collection products schema
const getCollectionProductsSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid(
        "manual",
        "best-selling",
        "created-desc",
        "created-asc",
        "price-desc",
        "price-asc",
        "alphabetical-asc",
        "alphabetical-desc"
      )
      .default("manual"),
    populate: Joi.boolean().default(true),
  }),
};

// Bulk update collections schema
const bulkUpdateCollectionsSchema = {
  body: Joi.object({
    updates: Joi.array()
      .items(
        Joi.object({
          collectionId: mongoIdSchema.required(),
          name: Joi.string().min(1).max(100).trim(),
          description: Joi.string().max(1000).trim().allow(""),
          isVisible: Joi.boolean(),
          isPublished: Joi.boolean(),
          sortOrder: Joi.string().valid(
            "manual",
            "best-selling",
            "created-desc",
            "created-asc",
            "price-desc",
            "price-asc",
            "alphabetical-asc",
            "alphabetical-desc"
          ),
          seo: seoSchema,
        }).min(2) // At least collectionId and one other field
      )
      .min(1)
      .max(50)
      .required()
      .messages({
        "array.min": "At least one update is required",
        "array.max": "Cannot update more than 50 collections at once",
      }),
  }).required(),
};

// Update collection visibility schema
const updateCollectionVisibilitySchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),

  body: Joi.object({
    isVisible: Joi.boolean().required().messages({
      "any.required": "Visibility status is required",
    }),
  }).required(),
};

// Get collections by seller schema
const getCollectionsBySellerSchema = {
  params: Joi.object({
    sellerId: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid seller ID format",
    }),
  }).required(),

  query: Joi.object({
    includeHidden: Joi.boolean().default(false),
    includeUnpublished: Joi.boolean().default(false),
  }),
};

// Get published collections schema
const getPublishedCollectionsSchema = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string()
      .valid("createdAt", "updatedAt", "name", "productCount", "viewCount")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

// Get collection statistics schema
const getCollectionStatsSchema = {
  query: Joi.object({
    sellerId: mongoIdSchema,
  }),
};

// Upload collection image schema
const uploadCollectionImageSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),
};

// Get my collections schema
const getMyCollectionsSchema = {
  query: Joi.object({
    includeHidden: Joi.boolean().default(false),
    includeUnpublished: Joi.boolean().default(false),
  }),
};

// Duplicate collection schema
const duplicateCollectionSchema = {
  params: Joi.object({
    id: mongoIdSchema.required().messages({
      "string.pattern.base": "Invalid collection ID format",
    }),
  }).required(),
};

module.exports = {
  createCollectionSchema,
  updateCollectionSchema,
  getCollectionByIdSchema,
  getCollectionByHandleSchema,
  getCollectionsSchema,
  deleteCollectionSchema,
  searchCollectionsSchema,
  addProductsToCollectionSchema,
  removeProductsFromCollectionSchema,
  getCollectionProductsSchema,
  bulkUpdateCollectionsSchema,
  updateCollectionVisibilitySchema,
  getCollectionsBySellerSchema,
  getPublishedCollectionsSchema,
  getCollectionStatsSchema,
  uploadCollectionImageSchema,
  getMyCollectionsSchema,
  duplicateCollectionSchema,
};
