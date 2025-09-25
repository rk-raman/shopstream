const express = require("express");
const router = express.Router();

// Middleware
const {
  authenticate,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const uploadMiddleware = require("../../upload/middleware/upload.middleware");

// Controllers
const categoryController = require("../controllers/category.controller");

// Validators
const categoryValidators = require("../validators/category.validators");

// ==================== PUBLIC ROUTES ====================

// Get category tree (public)
router.get(
  "/tree",
  categoryValidators.validateGetCategoryTree,
  categoryController.getCategoryTree
);

// Get featured categories (public)
router.get(
  "/featured",
  categoryValidators.validateGetFeaturedCategories,
  categoryController.getFeaturedCategories
);

// Get categories with filters (public)
router.get(
  "/",
  categoryValidators.validateGetCategories,
  categoryController.getCategories
);

// Search categories (public)
router.get(
  "/search",
  categoryValidators.validateSearchCategories,
  categoryController.searchCategories
);

// Get categories by level (public)
router.get(
  "/level/:level",
  categoryValidators.validateGetCategoriesByLevel,
  categoryController.getCategoriesByLevel
);

// Get root categories (public)
router.get("/root", categoryController.getRootCategories);

// Get category by slug (public)
router.get(
  "/slug/:slug",
  categoryValidators.validateGetCategoryBySlug,
  categoryController.getCategoryBySlug
);

// Get category by ID (public)
router.get(
  "/:id",
  categoryValidators.validateGetCategoryById,
  categoryController.getCategoryById
);

// Get category children (public)
router.get(
  "/:id/children",
  categoryValidators.validateGetCategoryById,
  categoryController.getCategoryChildren
);

// Get category ancestors (public)
router.get(
  "/:id/ancestors",
  categoryValidators.validateGetCategoryById,
  categoryController.getCategoryAncestors
);

// Get category descendants (public)
router.get(
  "/:id/descendants",
  categoryValidators.validateGetCategoryById,
  categoryController.getCategoryDescendants
);

// ==================== PROTECTED ROUTES ====================

// Apply authentication middleware to all routes below
router.use(authenticate);

// ==================== ADMIN ROUTES ====================

// Get category statistics (admin only)
router.get(
  "/admin/stats",
  authorize("admin"),
  categoryController.getCategoryStats
);

// Update product count for category (admin only)
router.patch(
  "/:id/product-count",
  authorize("admin"),
  categoryValidators.validateGetCategoryById,
  categoryController.updateCategoryProductCount
);

// ==================== SELLER/ADMIN ROUTES ====================

// Create new category (seller/admin)
router.post(
  "/",
  authorize("seller", "admin"),
  categoryValidators.validateCreateCategory,
  categoryController.createCategory
);

// Update category (seller/admin)
router.put(
  "/:id",
  authorize("seller", "admin"),
  categoryValidators.validateUpdateCategory,
  categoryController.updateCategory
);

// Delete category (seller/admin)
router.delete(
  "/:id",
  authorize("seller", "admin"),
  categoryValidators.validateDeleteCategory,
  categoryController.deleteCategory
);

// Update category sort order (seller/admin)
router.patch(
  "/:id/sort-order",
  authorize("seller", "admin"),
  categoryValidators.validateUpdateCategorySortOrder,
  categoryController.updateCategorySortOrder
);

// Bulk update categories (seller/admin)
router.patch(
  "/bulk/update",
  authorize("seller", "admin"),
  categoryValidators.validateBulkUpdateCategories,
  categoryController.bulkUpdateCategories
);

// Upload category image (seller/admin)
router.post(
  "/:id/image",
  authorize("seller", "admin"),
  uploadMiddleware.single("image"),
  categoryValidators.validateUploadCategoryImage,
  categoryController.uploadCategoryImage
);

// Remove category image (seller/admin)
router.delete(
  "/:id/image",
  authorize("seller", "admin"),
  categoryValidators.validateGetCategoryById,
  categoryController.removeCategoryImage
);

module.exports = router;
