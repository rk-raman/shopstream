const express = require("express");
const productController = require("../controllers/product.controller");
const {
  validateProductCreate,
  validateProductUpdate,
  validateProductSearch,
  validateProductId,
  validateProductImageUpload,
  validateProductReview,
  validateBulkProductOperation,
} = require("../validators/product.validators");
const {
  authenticate,
  adminOnly,
  sellerOrAdmin,
} = require("../../../shared/middleware/auth.middleware");
const upload = require("../../../shared/middleware/upload.middleware");
const {
  bulkProductCreateUpdateSchema,
} = require("../validators/product.schemas");
const {
  validateJoiBody,
} = require("../../../shared/middleware/validation.middleware");

const router = express.Router();

// Public routes (no authentication required)
router.get("/", validateProductSearch, productController.getAllProducts);
router.get("/search", validateProductSearch, productController.searchProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get(
  "/category/:categoryId",
  validateProductId,
  productController.getProductsByCategory
);
router.get("/seller/:sellerId", productController.getProductsBySeller);

// Alias for My Products using hyphen (must come BEFORE dynamic :productId routes)
router.get(
  "/my-products",
  authenticate,
  sellerOrAdmin,
  productController.getMyProducts
);

router.get("/:productId", validateProductId, productController.getProductById);
router.get("/slug/:slug", productController.getProductBySlug);
router.get(
  "/:productId/related",
  validateProductId,
  productController.getRelatedProducts
);
router.get(
  "/:productId/variants",
  validateProductId,
  productController.getProductVariants
);

// Authenticated routes
router.use(authenticate);

// Product reviews (authenticated users)
router.post(
  "/:productId/reviews",
  validateProductId,
  validateProductReview,
  productController.addProductReview
);

// Seller and Admin routes
router.use(sellerOrAdmin);

// Product management
router.post("/", validateProductCreate, productController.createProduct);
router.get("/my/products", productController.getMyProducts);
router.put(
  "/:productId",
  validateProductId,
  validateProductUpdate,
  productController.updateProduct
);
router.delete(
  "/:productId",
  validateProductId,
  productController.deleteProduct
);

// Product images
router.post(
  "/:productId/images",
  validateProductId,
  upload.array("images", 10),
  validateProductImageUpload,
  productController.uploadProductImages
);

// Stock management
router.patch(
  "/:productId/stock",
  validateProductId,
  productController.updateProductStock
);

// Variant management
router.post(
  "/:productId/variants",
  validateProductId,
  productController.addProductVariant
);
router.put(
  "/:productId/variants/:variantId",
  validateProductId,
  productController.updateProductVariant
);
router.delete(
  "/:productId/variants/:variantId",
  validateProductId,
  productController.deleteProductVariant
);

// Product statistics
router.get(
  "/:productId/stats",
  validateProductId,
  productController.getProductStats
);

// ==================== BULK OPERATIONS ROUTES ====================
// These should be BEFORE dynamic :productId routes

router.post(
  "/bulk/create-update",
  validateJoiBody(bulkProductCreateUpdateSchema),
  productController.bulkCreateUpdateProducts
);

router.post(
  "/bulk/validate",
  validateJoiBody(bulkProductCreateUpdateSchema),
  productController.validateBulkProducts
);

router.get("/bulk/template", productController.downloadBulkProductTemplate);

// Admin-only routes
router.use(adminOnly);

// Product approval
router.patch(
  "/:productId/approve",
  validateProductId,
  productController.approveProduct
);
router.patch(
  "/:productId/reject",
  validateProductId,
  productController.rejectProduct
);

// Featured products management
router.patch(
  "/:productId/featured",
  validateProductId,
  productController.toggleFeaturedStatus
);

// Bulk operations
router.post(
  "/bulk/update",
  validateBulkProductOperation,
  productController.bulkUpdateProducts
);

// Pending products
router.get("/admin/pending", productController.getPendingProducts);

module.exports = router;
