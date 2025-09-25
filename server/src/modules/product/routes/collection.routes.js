const express = require("express");
const router = express.Router();

// Middleware
const {
  authenticate,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const uploadMiddleware = require("../../upload/middleware/upload.middleware");
const {
  validateJoiMultiple,
} = require("../../../shared/middleware/validation.middleware");

// Controllers
const collectionController = require("../controllers/collection.controller");

// Schemas
const collectionSchemas = require("../validators/collection.schemas");

// ==================== PUBLIC ROUTES ====================

// Get published collections (public)
router.get(
  "/published",
  validateJoiMultiple(collectionSchemas.getPublishedCollectionsSchema),
  collectionController.getPublishedCollections
);

// Search collections (public)
router.get(
  "/search",
  validateJoiMultiple(collectionSchemas.searchCollectionsSchema),
  collectionController.searchCollections
);

// Get collections with filters (public)
router.get(
  "/",
  validateJoiMultiple(collectionSchemas.getCollectionsSchema),
  collectionController.getCollections
);

// Get collections by seller (public)
router.get(
  "/seller/:sellerId",
  validateJoiMultiple(collectionSchemas.getCollectionsBySellerSchema),
  collectionController.getCollectionsBySeller
);

// Get collection by handle (public)
router.get(
  "/handle/:handle",
  validateJoiMultiple(collectionSchemas.getCollectionByHandleSchema),
  collectionController.getCollectionByHandle
);

// Get collection by ID (public)
router.get(
  "/:id",
  validateJoiMultiple(collectionSchemas.getCollectionByIdSchema),
  collectionController.getCollectionById
);

// Get collection products (public)
router.get(
  "/:id/products",
  validateJoiMultiple(collectionSchemas.getCollectionProductsSchema),
  collectionController.getCollectionProducts
);

// ==================== PROTECTED ROUTES ====================

// Apply authentication middleware to all routes below
router.use(authenticate);

// ==================== AUTHENTICATED USER ROUTES ====================

// Get my collections (authenticated seller)
router.get(
  "/my/collections",
  validateJoiMultiple(collectionSchemas.getMyCollectionsSchema),
  collectionController.getMyCollections
);

// Get collection statistics (authenticated user)
router.get(
  "/stats/overview",
  validateJoiMultiple(collectionSchemas.getCollectionStatsSchema),
  collectionController.getCollectionStats
);

// ==================== SELLER/ADMIN ROUTES ====================

// Create new collection (seller/admin)
router.post(
  "/",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.createCollectionSchema),
  collectionController.createCollection
);

// Update collection (seller/admin)
router.put(
  "/:id",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.updateCollectionSchema),
  collectionController.updateCollection
);

// Delete collection (seller/admin)
router.delete(
  "/:id",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.deleteCollectionSchema),
  collectionController.deleteCollection
);

// Duplicate collection (seller/admin)
router.post(
  "/:id/duplicate",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.duplicateCollectionSchema),
  collectionController.duplicateCollection
);

// Update collection visibility (seller/admin)
router.patch(
  "/:id/visibility",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.updateCollectionVisibilitySchema),
  collectionController.updateCollectionVisibility
);

// Add products to collection (seller/admin)
router.post(
  "/:id/products",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.addProductsToCollectionSchema),
  collectionController.addProductsToCollection
);

// Remove products from collection (seller/admin)
router.delete(
  "/:id/products",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.removeProductsFromCollectionSchema),
  collectionController.removeProductsFromCollection
);

// Bulk update collections (seller/admin)
router.patch(
  "/bulk/update",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.bulkUpdateCollectionsSchema),
  collectionController.bulkUpdateCollections
);

// Upload collection image (seller/admin)
router.post(
  "/:id/image",
  authorize("seller", "admin"),
  uploadMiddleware.single("image"),
  validateJoiMultiple(collectionSchemas.uploadCollectionImageSchema),
  collectionController.uploadCollectionImage
);

// Remove collection image (seller/admin)
router.delete(
  "/:id/image",
  authorize("seller", "admin"),
  validateJoiMultiple(collectionSchemas.getCollectionByIdSchema),
  collectionController.removeCollectionImage
);

module.exports = router;
