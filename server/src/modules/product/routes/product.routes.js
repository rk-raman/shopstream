const express = require("express");
const productController = require("../controllers/product.controller");
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

// Public
router.get("/", validateProductSearch, productController.listProducts);
router.get("/search", validateProductSearch, productController.searchProducts);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:productId", validateProductId, productController.getProductById);

// Protected (seller/admin)
router.use(authenticate, sellerOrAdmin);
router.post("/", validateProductCreate, productController.createProduct);
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
router.post(
  "/:productId/images",
  upload.single("image"),
  validateProductId,
  validateProductImageUpload,
  productController.uploadImage
);

// Admin bulk operations
router.post(
  "/bulk",
  authenticate,
  adminOnly,
  validateBulkProductOperation,
  productController.bulkOperate
);

module.exports = router;
