const express = require("express");
const router = express.Router();

// Middleware
const {
  authenticate,
  authorize,
} = require("../../../shared/middleware/auth.middleware");
const uploadMiddleware = require("../../upload/middleware/upload.middleware");

// Controllers
const collectionController = require("../controllers/collection.controller");

// Validators
const collectionValidators = require("../validators/collection.validators");

// ==================== PUBLIC ROUTES ====================

// Get published collections (public)
router.get(
  "/published",
  collectionValidators.validateGetPublishedCollections,
  collectionController.getPublishedCollections
);

// Search collections (public)
router.get(
  "/search",
  collectionValidators.validateSearchCollections,
  collectionController.searchCollections
);

// Get collections with filters (public)
router.get(
  "/",
  collectionValidators.validateGetCollections,
  collectionController.getCollections
);

// Get collections by seller (public)
router.get(
  "/seller/:sellerId",
  collectionValidators.validateGetCollectionsBySeller,
  collectionController.getCollectionsBySeller
);

// Get collection by handle (public)
router.get(
  "/handle/:handle",
  collectionValidators.validateGetCollectionByHandle,
  collectionController.getCollectionByHandle
);

// Get collection by ID (public)
router.get(
  "/:id",
  collectionValidators.validateGetCollectionById,
  collectionController.getCollectionById
);

// Get collection products (public)
router.get(
  "/:id/products",
  collectionValidators.validateGetCollectionProducts,
  collectionController.getCollectionProducts
);

// ==================== PROTECTED ROUTES ====================

// Apply authentication middleware to all routes below
router.use(authenticate);

// ==================== AUTHENTICATED USER ROUTES ====================

// Get my collections (authenticated seller)
router.get(
  "/my/collections",
  collectionValidators.validateGetMyCollections,
  collectionController.getMyCollections
);

// Get collection statistics (authenticated user)
router.get(
  "/stats/overview",
  collectionValidators.validateGetCollectionStats,
  collectionController.getCollectionStats
);

// ==================== SELLER/ADMIN ROUTES ====================

// Create new collection (seller/admin)
router.post(
  "/",
  authorize(["seller", "admin"]),
  collectionValidators.validateCreateCollection,
  collectionController.createCollection
);

// Update collection (seller/admin)
router.put(
  "/:id",
  authorize(["seller", "admin"]),
  collectionValidators.validateUpdateCollection,
  collectionController.updateCollection
);

// Delete collection (seller/admin)
router.delete(
  "/:id",
  authorize(["seller", "admin"]),
  collectionValidators.validateDeleteCollection,
  collectionController.deleteCollection
);

// Duplicate collection (seller/admin)
router.post(
  "/:id/duplicate",
  authorize(["seller", "admin"]),
  collectionValidators.validateDuplicateCollection,
  collectionController.duplicateCollection
);

// Update collection visibility (seller/admin)
router.patch(
  "/:id/visibility",
  authorize(["seller", "admin"]),
  collectionValidators.validateUpdateCollectionVisibility,
  collectionController.updateCollectionVisibility
);

// Add products to collection (seller/admin)
router.post(
  "/:id/products",
  authorize(["seller", "admin"]),
  collectionValidators.validateAddProductsToCollection,
  collectionController.addProductsToCollection
);

// Remove products from collection (seller/admin)
router.delete(
  "/:id/products",
  authorize(["seller", "admin"]),
  collectionValidators.validateRemoveProductsFromCollection,
  collectionController.removeProductsFromCollection
);

// Bulk update collections (seller/admin)
router.patch(
  "/bulk/update",
  authorize(["seller", "admin"]),
  collectionValidators.validateBulkUpdateCollections,
  collectionController.bulkUpdateCollections
);

// Upload collection image (seller/admin)
router.post(
  "/:id/image",
  authorize(["seller", "admin"]),
  uploadMiddleware.single("image"),
  collectionValidators.validateUploadCollectionImage,
  collectionController.uploadCollectionImage
);

// Remove collection image (seller/admin)
router.delete(
  "/:id/image",
  authorize(["seller", "admin"]),
  collectionValidators.validateGetCollectionById,
  collectionController.removeCollectionImage
);

module.exports = router;
