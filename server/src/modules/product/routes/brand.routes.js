const express = require("express");
const router = express.Router();

// Middleware
const {
  authenticate,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const {
  validateJoiMultiple,
} = require("../../../shared/middleware/validation.middleware");

// Controller
const brandController = require("../controllers/brand.controller");

// Schemas
const brandSchemas = require("../validators/brand.schemas");

// ==================== PUBLIC ROUTES ====================

// Get brands with filters
router.get(
  "/",
  validateJoiMultiple(brandSchemas.getBrandsSchema),
  brandController.getBrands
);

// Get brand by id
router.get(
  "/:id",
  validateJoiMultiple(brandSchemas.getBrandByIdSchema),
  brandController.getBrandById
);

// Get brand by slug
router.get(
  "/slug/:slug",
  validateJoiMultiple(brandSchemas.getBrandBySlugSchema),
  brandController.getBrandBySlug
);

// Search brands
router.get(
  "/search",
  validateJoiMultiple(brandSchemas.searchBrandsSchema),
  brandController.searchBrands
);

// Lists
router.get("/active", brandController.getActiveBrands);
router.get("/featured", brandController.getFeaturedBrands);
router.get("/verified", brandController.getVerifiedBrands);
router.get(
  "/popular",
  validateJoiMultiple(brandSchemas.getPopularBrandsSchema),
  brandController.getPopularBrands
);
router.get(
  "/category/:categoryId",
  validateJoiMultiple(brandSchemas.getBrandsByCategorySchema),
  brandController.getBrandsByCategory
);
router.get("/alphabet", brandController.getBrandsByAlphabet);

// ==================== PROTECTED ROUTES ====================
router.use(authenticate);

// Create brand (seller/admin)
router.post(
  "/",
  authorize("seller", "admin"),
  validateJoiMultiple(brandSchemas.createBrandSchema),
  brandController.createBrand
);

// Update brand (seller/admin)
router.put(
  "/:id",
  authorize("seller", "admin"),
  validateJoiMultiple(brandSchemas.updateBrandSchema),
  brandController.updateBrand
);

// Delete brand (seller/admin)
router.delete(
  "/:id",
  authorize("seller", "admin"),
  validateJoiMultiple(brandSchemas.deleteBrandSchema),
  brandController.deleteBrand
);

// Bulk delete brands (seller/admin)
router.delete(
  "/bulk",
  authorize("seller", "admin"),
  brandController.bulkDeleteBrands
);

// Status/flags (seller/admin)
router.patch(
  "/:id/status",
  authorize("seller", "admin"),
  validateJoiMultiple(brandSchemas.updateStatusSchema),
  brandController.updateBrandStatus
);

router.patch(
  "/:id/featured",
  authorize("seller", "admin"),
  validateJoiMultiple(brandSchemas.updateFeaturedSchema),
  brandController.updateBrandFeatured
);

router.patch(
  "/:id/verified",
  authorize("seller", "admin"),
  validateJoiMultiple(brandSchemas.updateVerifiedSchema),
  brandController.updateBrandVerified
);

router.patch(
  "/:id/sort-order",
  authorize("seller", "admin"),
  validateJoiMultiple(brandSchemas.updateSortOrderSchema),
  brandController.updateBrandSortOrder
);

module.exports = router;
