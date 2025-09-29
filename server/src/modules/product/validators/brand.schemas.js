const Joi = require("joi");

// Common helpers
const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ID");
const bool = Joi.boolean();
const pagination = {
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(200).optional(),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "name", "productCount", "viewCount")
    .optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
};

// Create/Update brand payload
const mediaSchema = Joi.object({
  public_id: Joi.string().allow(null, ""),
  url: Joi.string().uri().required(),
  caption: Joi.string().optional(),
});

const brandPayload = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  slug: Joi.string()
    .lowercase()
    .regex(/^[a-z0-9-]+$/)
    .required(),
  description: Joi.string().max(1000).allow("", null),
  shortDescription: Joi.string().max(200).allow("", null),
  logo: mediaSchema.optional(),
  banner: mediaSchema.optional(),
  images: Joi.array().items(mediaSchema).optional(),
  companyInfo: Joi.object({
    foundedYear: Joi.number().integer().min(1800).max(3000).allow(null),
    headquarters: Joi.string().allow("", null),
    website: Joi.string().uri().allow("", null),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
    address: Joi.object({
      street: Joi.string().allow("", null),
      city: Joi.string().allow("", null),
      state: Joi.string().allow("", null),
      country: Joi.string().allow("", null),
      zipCode: Joi.string().allow("", null),
    }).optional(),
  }).optional(),
  socialMedia: Joi.object({
    facebook: Joi.string().uri().allow("", null),
    twitter: Joi.string().uri().allow("", null),
    instagram: Joi.string().uri().allow("", null),
    linkedin: Joi.string().uri().allow("", null),
    youtube: Joi.string().uri().allow("", null),
    tiktok: Joi.string().uri().allow("", null),
  }).optional(),
  metaTitle: Joi.string().max(60).allow("", null),
  metaDescription: Joi.string().max(160).allow("", null),
  metaKeywords: Joi.array().items(Joi.string()).optional(),
  isActive: bool.optional(),
  isFeatured: bool.optional(),
  isVerified: bool.optional(),
  productCount: Joi.number().integer().min(0).optional(),
  viewCount: Joi.number().integer().min(0).optional(),
  followerCount: Joi.number().integer().min(0).optional(),
  sortOrder: Joi.number().integer().optional(),
  categories: Joi.array().items(objectId).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  commission: Joi.number().min(0).max(100).optional(),
  guidelines: Joi.object({
    logoUsage: Joi.string().allow("", null),
    colorPalette: Joi.array().items(Joi.string()).optional(),
    typography: Joi.string().allow("", null),
    toneOfVoice: Joi.string().allow("", null),
  }).optional(),
});

// Schemas
const getBrandsSchema = {
  query: Joi.object({
    ...pagination,
    search: Joi.string().optional(),
    isActive: bool.optional(),
    isFeatured: bool.optional(),
    isVerified: bool.optional(),
    categories: Joi.alternatives()
      .try(Joi.array().items(objectId), objectId)
      .optional(),
  }),
};

const getBrandByIdSchema = { params: Joi.object({ id: objectId.required() }) };
const getBrandBySlugSchema = {
  params: Joi.object({ slug: Joi.string().required() }),
};

const createBrandSchema = { body: brandPayload.required() };
const updateBrandSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: brandPayload.min(1),
};
const deleteBrandSchema = { params: Joi.object({ id: objectId.required() }) };

const searchBrandsSchema = {
  query: Joi.object({
    q: Joi.string().required(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

const getBrandsByCategorySchema = {
  params: Joi.object({ categoryId: objectId.required() }),
};

const getPopularBrandsSchema = {
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

const updateStatusSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({ isActive: bool.required() }),
};
const updateFeaturedSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({ isFeatured: bool.required() }),
};
const updateVerifiedSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({ isVerified: bool.required() }),
};
const updateSortOrderSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({ sortOrder: Joi.number().integer().required() }),
};

module.exports = {
  getBrandsSchema,
  getBrandByIdSchema,
  getBrandBySlugSchema,
  createBrandSchema,
  updateBrandSchema,
  deleteBrandSchema,
  searchBrandsSchema,
  getBrandsByCategorySchema,
  getPopularBrandsSchema,
  updateStatusSchema,
  updateFeaturedSchema,
  updateVerifiedSchema,
  updateSortOrderSchema,
};
