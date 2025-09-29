const Brand = require("../models/Brand.model");
const ApiError = require("../../../shared/utils/ApiError");

/**
 * Create a new brand
 */
async function createBrand(data) {
  // Ensure slug uniqueness
  if (!data.slug && data.name) {
    data.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  const existing = await Brand.findOne({
    $or: [{ name: data.name }, { slug: data.slug }],
  });
  if (existing) {
    throw new ApiError(400, "Brand with same name or slug already exists");
  }
  const brand = await Brand.create(data);
  return brand;
}

/**
 * Update a brand by id
 */
async function updateBrand(id, updates) {
  const brand = await Brand.findById(id);
  if (!brand) throw new ApiError(404, "Brand not found");

  // If updating slug/name ensure uniqueness
  if (updates.slug || updates.name) {
    const slug = (updates.slug || brand.slug).toLowerCase();
    const conflict = await Brand.findOne({ slug, _id: { $ne: id } });
    if (conflict)
      throw new ApiError(400, "Another brand already uses this slug");
    updates.slug = slug;
  }

  Object.assign(brand, updates);
  await brand.save();
  return brand;
}

/**
 * Delete a brand by id
 */
async function deleteBrand(id) {
  const brand = await Brand.findById(id);
  if (!brand) throw new ApiError(404, "Brand not found");
  await brand.deleteOne();
  return { message: "Brand deleted successfully" };
}

/**
 * Get brands with filters and pagination
 */
async function getBrands(filters = {}, pagination = {}) {
  const query = {};
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (typeof filters.isActive === "boolean") query.isActive = filters.isActive;
  if (typeof filters.isFeatured === "boolean")
    query.isFeatured = filters.isFeatured;
  if (typeof filters.isVerified === "boolean")
    query.isVerified = filters.isVerified;
  if (Array.isArray(filters.categories) && filters.categories.length > 0) {
    query.categories = { $in: filters.categories };
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const sortBy = pagination.sortBy || "createdAt";
  const sortOrder = pagination.sortOrder === "asc" ? 1 : -1;

  const result = await Brand.paginate(query, {
    page,
    limit,
    sort: { [sortBy]: sortOrder },
    populate: [{ path: "categories", select: "name slug" }],
    lean: true,
  });

  return result;
}

async function getBrandById(id) {
  const brand = await Brand.findById(id).populate("categories", "name slug");
  if (!brand) throw new ApiError(404, "Brand not found");
  return brand;
}

async function getBrandBySlug(slug) {
  const brand = await Brand.findOne({ slug }).populate(
    "categories",
    "name slug"
  );
  if (!brand) throw new ApiError(404, "Brand not found");
  return brand;
}

async function searchBrands(searchTerm, { limit = 20 } = {}) {
  if (!searchTerm) return [];
  const brands = await Brand.find({
    $text: { $search: searchTerm },
    isActive: true,
  })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
  return brands;
}

async function getActiveBrands() {
  return Brand.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
}
async function getFeaturedBrands() {
  return Brand.find({ isActive: true, isFeatured: true }).sort({
    sortOrder: 1,
    name: 1,
  });
}
async function getVerifiedBrands() {
  return Brand.find({ isActive: true, isVerified: true }).sort({
    sortOrder: 1,
    name: 1,
  });
}
async function getPopularBrands(limit = 20) {
  return Brand.find({ isActive: true })
    .sort({ productCount: -1, viewCount: -1 })
    .limit(limit);
}

async function getBrandsByCategory(categoryId) {
  return Brand.find({ categories: categoryId, isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
}

async function getBrandsByAlphabet() {
  return Brand.getBrandsByAlphabet();
}

async function updateStatus(id, isActive) {
  return updateBrand(id, { isActive });
}
async function updateFeatured(id, isFeatured) {
  return updateBrand(id, { isFeatured });
}
async function updateVerified(id, isVerified) {
  return updateBrand(id, { isVerified });
}
async function updateSortOrder(id, sortOrder) {
  return updateBrand(id, { sortOrder });
}

async function bulkDelete(brandIds = []) {
  await Brand.deleteMany({ _id: { $in: brandIds } });
  return { message: `${brandIds.length} brand(s) deleted` };
}

module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrands,
  getBrandById,
  getBrandBySlug,
  searchBrands,
  getActiveBrands,
  getFeaturedBrands,
  getVerifiedBrands,
  getPopularBrands,
  getBrandsByCategory,
  getBrandsByAlphabet,
  updateStatus,
  updateFeatured,
  updateVerified,
  updateSortOrder,
  bulkDelete,
};
