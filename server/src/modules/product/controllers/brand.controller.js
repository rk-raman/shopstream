const brandService = require("../services/brand.service");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Create brand
const createBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.createBrand(req.body);
  return res.created(brand, "Brand created successfully");
});

// Get brands (paginated)
const getBrands = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    isActive,
    isFeatured,
    isVerified,
    categories,
  } = req.query;
  const filters = {
    search,
    isActive: typeof isActive === "string" ? isActive === "true" : undefined,
    isFeatured:
      typeof isFeatured === "string" ? isFeatured === "true" : undefined,
    isVerified:
      typeof isVerified === "string" ? isVerified === "true" : undefined,
    categories: categories
      ? Array.isArray(categories)
        ? categories
        : [categories]
      : undefined,
  };
  const pagination = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    sortBy: sortBy || "createdAt",
    sortOrder: sortOrder || "desc",
  };
  const result = await brandService.getBrands(filters, pagination);
  return res.success(result, "Brands retrieved successfully");
});

// Get brand by id
const getBrandById = asyncHandler(async (req, res) => {
  const brand = await brandService.getBrandById(req.params.id);
  return res.success(brand, "Brand retrieved successfully");
});

// Get brand by slug
const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await brandService.getBrandBySlug(req.params.slug);
  return res.success(brand, "Brand retrieved successfully");
});

// Update brand
const updateBrand = asyncHandler(async (req, res) => {
  const brand = await brandService.updateBrand(req.params.id, req.body);
  return res.success(brand, "Brand updated successfully");
});

// Delete brand
const deleteBrand = asyncHandler(async (req, res) => {
  const result = await brandService.deleteBrand(req.params.id);
  return res.success(null, result.message);
});

// Status/flags
const updateBrandStatus = asyncHandler(async (req, res) => {
  const brand = await brandService.updateStatus(
    req.params.id,
    req.body.isActive
  );
  return res.success(brand, "Brand status updated");
});

const updateBrandFeatured = asyncHandler(async (req, res) => {
  const brand = await brandService.updateFeatured(
    req.params.id,
    req.body.isFeatured
  );
  return res.success(brand, "Brand featured flag updated");
});

const updateBrandVerified = asyncHandler(async (req, res) => {
  const brand = await brandService.updateVerified(
    req.params.id,
    req.body.isVerified
  );
  return res.success(brand, "Brand verified flag updated");
});

const updateBrandSortOrder = asyncHandler(async (req, res) => {
  const brand = await brandService.updateSortOrder(
    req.params.id,
    req.body.sortOrder
  );
  return res.success(brand, "Brand sort order updated");
});

// Lists
const getActiveBrands = asyncHandler(async (_req, res) => {
  const brands = await brandService.getActiveBrands();
  return res.success(brands, "Active brands retrieved");
});

const getFeaturedBrands = asyncHandler(async (_req, res) => {
  const brands = await brandService.getFeaturedBrands();
  return res.success(brands, "Featured brands retrieved");
});

const getVerifiedBrands = asyncHandler(async (_req, res) => {
  const brands = await brandService.getVerifiedBrands();
  return res.success(brands, "Verified brands retrieved");
});

const getPopularBrands = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const brands = await brandService.getPopularBrands(limit);
  return res.success(brands, "Popular brands retrieved");
});

const getBrandsByCategory = asyncHandler(async (req, res) => {
  const brands = await brandService.getBrandsByCategory(req.params.categoryId);
  return res.success(brands, "Brands by category retrieved");
});

const getBrandsByAlphabet = asyncHandler(async (_req, res) => {
  const groups = await brandService.getBrandsByAlphabet();
  return res.success(groups, "Brands by alphabet retrieved");
});

// Search
const searchBrands = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;
  const results = await brandService.searchBrands(q, {
    limit: parseInt(limit) || 20,
  });
  return res.success(results, "Brand search completed");
});

// Bulk delete
const bulkDeleteBrands = asyncHandler(async (req, res) => {
  const { brandIds } = req.body;
  const result = await brandService.bulkDelete(brandIds || []);
  return res.success(result, "Bulk delete completed");
});

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  getBrandBySlug,
  updateBrand,
  deleteBrand,
  updateBrandStatus,
  updateBrandFeatured,
  updateBrandVerified,
  updateBrandSortOrder,
  getActiveBrands,
  getFeaturedBrands,
  getVerifiedBrands,
  getPopularBrands,
  getBrandsByCategory,
  getBrandsByAlphabet,
  searchBrands,
  bulkDeleteBrands,
};
