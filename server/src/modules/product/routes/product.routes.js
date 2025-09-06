const express = require("express");
const controller = require("../controllers/product.controller");
const searchController = require("../controllers/search.controller");
const {
  validateProductCreate,
  validateProductUpdate,
  validateProductSearch,
  validateProductId,
  validateProductImageUpload,
  validateBulkProductOperation,
} = require("../validators/product.validators");
const {
  authenticate,
  sellerOrAdmin,
  adminOnly,
  optionalAuth,
} = require("../../../shared/middleware/auth.middleware");
const upload = require("../../../shared/middleware/upload.middleware");

const router = express.Router();

// Public product listing and search
router.get("/", validateProductSearch, controller.listProducts);
router.get("/search", validateProductSearch, searchController.searchProducts);
router.get("/search/suggestions", searchController.getSuggestions);

// Product CRUD (protected)
router.post("/", authenticate, sellerOrAdmin, validateProductCreate, controller.createProduct);
router.get("/:productId", validateProductId, controller.getProductById);
router.put(
  "/:productId",
  authenticate,
  sellerOrAdmin,
  validateProductId,
  validateProductUpdate,
  controller.updateProduct
);
router.delete(
  "/:productId",
  authenticate,
  sellerOrAdmin,
  validateProductId,
  controller.deleteProduct
);

// Product image upload
router.post(
  "/:productId/images",
  authenticate,
  sellerOrAdmin,
  validateProductId,
  upload.single("image"),
  validateProductImageUpload,
  controller.uploadProductImage
);

// Bulk operations (admin)
router.post(
  "/bulk",
  authenticate,
  adminOnly,
  validateBulkProductOperation,
  controller.bulkOperation
);

// Recommendations and similar products
router.get("/:productId/similar", searchController.getSimilarProducts);

module.exports = router;

