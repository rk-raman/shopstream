const express = require("express");
const { authenticate } = require("../../../shared/middleware/auth.middleware");
const {
  validate,
} = require("../../../shared/middleware/validation.middleware");
const uploadController = require("../controllers/upload.controller");
const uploadValidators = require("../validators/upload.validators");
const uploadMiddleware = require("../middleware/upload.middleware");

const router = express.Router();

// Apply authentication to all upload routes
router.use(authenticate);

// Avatar upload routes
router.post(
  "/avatar",
  uploadMiddleware.single("avatar"),
  validate(uploadValidators.validateUploadAvatar),
  uploadController.uploadAvatar
);

router.post(
  "/avatar/:userId",
  uploadMiddleware.single("avatar"),
  validate(uploadValidators.validateUploadAvatar),
  uploadController.uploadAvatar
);

// Product image upload routes
router.post(
  "/products/images",
  uploadMiddleware.multiple("productImages", 10),
  validate(uploadValidators.validateUploadProductImages),
  uploadController.uploadProductImages
);

router.post(
  "/products/:productId/images",
  uploadMiddleware.multiple("productImages", 10),
  validate(uploadValidators.validateUploadProductImages),
  uploadController.uploadProductImages
);

// Banner upload routes
router.post(
  "/banners",
  uploadMiddleware.single("banner"),
  validate(uploadValidators.validateUploadBanner),
  uploadController.uploadBanner
);

// Category image upload routes
router.post(
  "/categories/:categoryId/image",
  uploadMiddleware.single("categoryImage"),
  validate(uploadValidators.validateUploadCategoryImage),
  uploadController.uploadCategoryImage
);

// Generic file upload route
router.post(
  "/custom",
  uploadMiddleware.single("file"),
  validate(uploadValidators.validateUploadFile),
  uploadController.customUpload
);

// Bulk file upload route
router.post(
  "/bulk",
  uploadMiddleware.multiple("files", 20),
  validate(uploadValidators.validateBulkUpload),
  uploadController.bulkUpload
);

// File management routes
router.delete(
  "/files/:publicId",
  validate(uploadValidators.validateDeleteFile),
  uploadController.deleteFile
);

router.delete(
  "/files",
  validate(uploadValidators.validateDeleteMultiple),
  uploadController.deleteMultiple
);

router.get("/files/:publicId/info", uploadController.getFileInfo);

// Signed URL generation
router.post(
  "/signed-url",
  validate(uploadValidators.validateGenerateSignedUrl),
  uploadController.generateSignedUrl
);

// Image transformation routes
router.post(
  "/transform/:publicId",
  validate(uploadValidators.validateTransformImage),
  uploadController.transformImage
);

// Provider management routes (admin only)
router.post(
  "/provider/switch",
  validate(uploadValidators.validateSwitchProvider),
  uploadController.switchProvider
);

router.get("/provider/info", uploadController.getProviderInfo);

// Utility Routes
router.get("/admin/stats", uploadController.getUploadStats);

router.get("/admin/health", uploadController.getProviderHealth);

/**
 * Error handling middleware
 */
router.use(uploadMiddleware.handleUploadError());

module.exports = router;
