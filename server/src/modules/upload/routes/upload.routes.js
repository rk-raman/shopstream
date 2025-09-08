const express = require("express");
const uploadController = require("../controllers/upload.controller");
const uploadMiddleware = require("../middleware/upload.middleware");
const { authenticate } = require("../../../shared/middleware/auth.middleware");
const { authorize } = require("../../../shared/middleware/rbac.middleware");

const router = express.Router();

// Apply authentication to all upload routes
router.use(authenticate);

/**
 * Avatar Upload Routes (Users)
 */
router.post(
  "/avatar",
  uploadMiddleware.avatar(),
  uploadController.uploadAvatar
);

router.post(
  "/avatar/:userId",
  authorize(["admin"]), // Only admin can upload avatar for other users
  uploadMiddleware.avatar(),
  uploadController.uploadAvatar
);

/**
 * Product Images Upload Routes (Sellers)
 */
router.post(
  "/products/images",
  authorize(["seller", "admin"]),
  uploadMiddleware.productImages(5), // Max 5 images
  uploadController.uploadProductImages
);

router.post(
  "/products/:productId/images",
  authorize(["seller", "admin"]),
  uploadMiddleware.productImages(5),
  uploadController.uploadProductImages
);

/**
 * Banner Upload Routes (Admin only)
 */
router.post(
  "/banners",
  authorize(["admin"]),
  uploadMiddleware.banner(),
  uploadController.uploadBanner
);

/**
 * Category Image Upload Routes (Admin only)
 */
router.post(
  "/categories/:categoryId/image",
  authorize(["admin"]),
  uploadMiddleware.categoryImage(),
  uploadController.uploadCategoryImage
);

/**
 * Custom Upload Routes
 */
router.post(
  "/custom",
  uploadMiddleware.single("file"),
  uploadController.customUpload
);

router.post(
  "/bulk",
  uploadMiddleware.multiple("files", 10), // Max 10 files
  uploadController.bulkUpload
);

/**
 * File Management Routes
 */
router.delete("/files/:publicId", uploadController.deleteFile);

router.delete("/files", uploadController.deleteMultiple);

router.get("/files/:publicId/info", uploadController.getFileInfo);

/**
 * Utility Routes
 */
router.post("/signed-url", uploadController.generateSignedUrl);

router.post("/transform/:publicId", uploadController.transformImage);

router.get("/provider/info", uploadController.getProviderInfo);

router.post(
  "/provider/switch",
  authorize(["admin"]),
  uploadController.switchProvider
);

/**
 * Error handling middleware
 */
router.use(uploadMiddleware.handleUploadError());

module.exports = router;
