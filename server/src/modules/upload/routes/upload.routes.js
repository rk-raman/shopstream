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
  uploadValidators.validateUploadAvatar,
  uploadController.uploadAvatar
);

router.post(
  "/avatar/:userId",
  uploadMiddleware.single("avatar"),
  uploadValidators.validateUploadAvatar,
  uploadController.uploadAvatar
);

// Product image upload routes
router.post(
  "/products/images",
  uploadMiddleware.multiple("productImages", 10),
  uploadValidators.validateUploadProductImages,
  uploadController.uploadProductImages
);

router.post(
  "/products/:productId/images",
  uploadMiddleware.multiple("productImages", 10),
  uploadValidators.validateUploadProductImages,
  uploadController.uploadProductImages
);

// Banner upload routes
router.post(
  "/banners",
  uploadMiddleware.single("banner"),
  uploadValidators.validateUploadBanner,
  uploadController.uploadBanner
);

// Category image upload routes
router.post(
  "/categories/:categoryId/image",
  uploadMiddleware.single("categoryImage"),
  uploadValidators.validateUploadCategoryImage,
  uploadController.uploadCategoryImage
);

// Generic file upload route
router.post(
  "/custom",
  ...uploadMiddleware.custom("file", "single"),
  uploadValidators.validateCustomUpload,
  uploadController.customUpload
);

// Param-based generic upload route: uploads into the folder from URL params
// Example: POST /api/v1/uploads/folders/categories/123/image
// Will set category = "categories/123/image"
router.post(
  "/folders/:categoryPath(*)",
  (req, res, next) => {
    req.body = req.body || {};
    req.body.category = req.params.categoryPath;
    next();
  },
  ...uploadMiddleware.custom("file", "single"),
  uploadValidators.validateCustomUpload,
  uploadController.customUpload
);

// Param-based generic MULTIPLE upload route
// Example: POST /api/v1/uploads/folders/brands/abc/images/multiple
router.post(
  "/folders/:categoryPath(*)/multiple",
  (req, res, next) => {
    req.body = req.body || {};
    req.body.category = req.params.categoryPath;
    next();
  },
  ...uploadMiddleware.custom("files", "multiple", { maxCount: 20 }),
  uploadValidators.validateBulkUpload,
  uploadController.bulkUpload
);

// Bulk file upload route
router.post(
  "/bulk",
  uploadMiddleware.multiple("files", 20),
  uploadValidators.validateBulkUpload,
  uploadController.bulkUpload
);

// File management routes
router.delete(
  "/files/:publicId",
  uploadValidators.validateDeleteFile,
  uploadController.deleteFile
);

router.delete(
  "/files",
  uploadValidators.validateDeleteMultiple,
  uploadController.deleteMultiple
);

router.get("/files/:publicId/info", uploadController.getFileInfo);

// Signed URL generation
router.post(
  "/signed-url",
  uploadValidators.validateGenerateSignedUrl,
  uploadController.generateSignedUrl
);

// Image transformation routes
router.post(
  "/transform/:publicId",
  uploadValidators.validateTransformImage,
  uploadController.transformImage
);

// Provider management routes (admin only)
router.post(
  "/provider/switch",
  uploadValidators.validateSwitchProvider,
  uploadController.switchProvider
);

router.get("/provider/info", uploadController.getProviderInfo);

// Utility Routes
router.get("/admin/stats", uploadController.getUploadStats);

router.get("/admin/health", uploadController.getProviderHealth);

// Brand upload routes
router.post(
  "/brands/:brandId/logo",
  uploadMiddleware.single("logo"),
  uploadValidators.validateUploadAvatar,
  uploadController.uploadBrandLogo
);

router.post(
  "/brands/:brandId/banner",
  uploadMiddleware.single("banner"),
  uploadValidators.validateUploadBanner,
  uploadController.uploadBrandBanner
);

router.post(
  "/brands/:brandId/images",
  uploadMiddleware.multiple("images", 10),
  uploadValidators.validateUploadProductImages,
  uploadController.uploadBrandImages
);

// Collection upload route
router.post(
  "/collections/:collectionId/image",
  uploadMiddleware.single("image"),
  uploadValidators.validateUploadCategoryImage,
  uploadController.uploadCollectionImage
);

/**
 * Error handling middleware
 */
router.use(uploadMiddleware.handleUploadError());

module.exports = router;
