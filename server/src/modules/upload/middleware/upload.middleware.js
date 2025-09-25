const multer = require("multer");
const uploadService = require("../services/upload.service");
const ApiError = require("../../../shared/utils/apiError");
const config = require("../../../config");

/**
 * Enhanced Upload Middleware
 * Integrates with the modular upload service and supports different providers
 */
class UploadMiddleware {
  constructor() {
    this.uploadService = new uploadService();
    this.config = config.upload;
  }

  /**
   * Configure multer for memory storage (files will be processed by upload service)
   */
  getMulterConfig(options = {}) {
    const {
      maxFileSize = this.config.maxFileSize,
      allowedMimeTypes = this.config.allowedMimeTypes,
      maxFiles = 10,
    } = options;

    const storage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
      // Check MIME type
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            400,
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`
          ),
          false
        );
      }
    };

    return multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: maxFileSize,
        files: maxFiles,
      },
    });
  }

  /**
   * Single file upload middleware
   */
  single(fieldName, options = {}) {
    const upload = this.getMulterConfig(options);

    return [
      upload.single(fieldName),
      async (req, res, next) => {
        try {
          if (!req.file) {
            return next(new ApiError(400, "No file uploaded"));
          }

          // Add file buffer to request for service processing
          req.fileBuffer = req.file.buffer;
          req.fileInfo = {
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
          };

          next();
        } catch (error) {
          next(new ApiError(500, `Upload middleware error: ${error.message}`));
        }
      },
    ];
  }

  /**
   * Multiple files upload middleware
   */
  multiple(fieldName, maxCount = 5, options = {}) {
    const upload = this.getMulterConfig({ ...options, maxFiles: maxCount });

    return [
      upload.array(fieldName, maxCount),
      async (req, res, next) => {
        try {
          if (!req.files || req.files.length === 0) {
            return next(new ApiError(400, "No files uploaded"));
          }

          // Add file buffers to request for service processing
          req.fileBuffers = req.files.map((file) => file.buffer);
          req.filesInfo = req.files.map((file) => ({
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          }));

          next();
        } catch (error) {
          next(new ApiError(500, `Upload middleware error: ${error.message}`));
        }
      },
    ];
  }

  /**
   * Avatar upload middleware (for users)
   */
  avatar(options = {}) {
    const avatarOptions = {
      maxFileSize: 2 * 1024 * 1024, // 2MB for avatars
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      ...options,
    };

    return [
      ...this.single("avatar", avatarOptions),
      async (req, res, next) => {
        try {
          const userId = req.user?.id || req.params.userId;
          if (!userId) {
            return next(new ApiError(400, "User ID is required"));
          }

          const result = await this.uploadService.uploadAvatar(
            req.fileBuffer,
            userId,
            {
              fileName: req.fileInfo.originalName,
              metadata: {
                originalName: req.fileInfo.originalName,
                mimeType: req.fileInfo.mimeType,
                size: req.fileInfo.size,
              },
            }
          );

          req.uploadResult = result;
          next();
        } catch (error) {
          next(new ApiError(500, `Avatar upload failed: ${error.message}`));
        }
      },
    ];
  }

  /**
   * Product images upload middleware (for sellers)
   */
  productImages(maxCount = 5, options = {}) {
    const productOptions = {
      maxFileSize: 5 * 1024 * 1024, // 5MB for product images
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      ...options,
    };

    return [
      ...this.multiple("productImages", maxCount, productOptions),
      async (req, res, next) => {
        try {
          const sellerId = req.user?.id || req.params.sellerId;
          const productId = req.params.productId || req.body.productId;

          if (!sellerId) {
            return next(new ApiError(400, "Seller ID is required"));
          }

          const result = await this.uploadService.uploadProductImages(
            req.fileBuffers,
            sellerId,
            productId,
            {
              metadata: {
                filesInfo: req.filesInfo,
              },
            }
          );

          req.uploadResult = result;
          next();
        } catch (error) {
          next(
            new ApiError(500, `Product images upload failed: ${error.message}`)
          );
        }
      },
    ];
  }

  /**
   * Banner upload middleware (for admins)
   */
  banner(options = {}) {
    const bannerOptions = {
      maxFileSize: 10 * 1024 * 1024, // 10MB for banners
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      ...options,
    };

    return [
      ...this.single("banner", bannerOptions),
      async (req, res, next) => {
        try {
          const adminId = req.user?.id;
          if (!adminId || req.user?.role !== "admin") {
            return next(new ApiError(403, "Admin access required"));
          }

          const result = await this.uploadService.uploadBanner(
            req.fileBuffer,
            adminId,
            {
              fileName: req.fileInfo.originalName,
              metadata: {
                originalName: req.fileInfo.originalName,
                mimeType: req.fileInfo.mimeType,
                size: req.fileInfo.size,
              },
            }
          );

          req.uploadResult = result;
          next();
        } catch (error) {
          next(new ApiError(500, `Banner upload failed: ${error.message}`));
        }
      },
    ];
  }

  /**
   * Category image upload middleware (for admins)
   */
  categoryImage(options = {}) {
    const categoryOptions = {
      maxFileSize: 3 * 1024 * 1024, // 3MB for category images
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      ...options,
    };

    return [
      ...this.single("categoryImage", categoryOptions),
      async (req, res, next) => {
        try {
          const adminId = req.user?.id;
          const categoryId = req.params.categoryId || req.body.categoryId;

          if (!adminId || req.user?.role !== "admin") {
            return next(new ApiError(403, "Admin access required"));
          }

          if (!categoryId) {
            return next(new ApiError(400, "Category ID is required"));
          }

          const result = await this.uploadService.uploadCategoryImage(
            req.fileBuffer,
            adminId,
            categoryId,
            {
              fileName: req.fileInfo.originalName,
              metadata: {
                originalName: req.fileInfo.originalName,
                mimeType: req.fileInfo.mimeType,
                size: req.fileInfo.size,
              },
            }
          );

          req.uploadResult = result;
          next();
        } catch (error) {
          next(
            new ApiError(500, `Category image upload failed: ${error.message}`)
          );
        }
      },
    ];
  }

  /**
   * Generic upload middleware with custom options
   */
  custom(fieldName, uploadType = "single", options = {}) {
    const {
      userType = "user",
      category = "general",
      maxCount = 1,
      ...uploadOptions
    } = options;

    const middlewareChain =
      uploadType === "multiple"
        ? this.multiple(fieldName, maxCount, uploadOptions)
        : this.single(fieldName, uploadOptions);

    return [
      ...middlewareChain,
      async (req, res, next) => {
        try {
          const userId = req.user?.id || req.params.userId;
          if (!userId) {
            return next(new ApiError(400, "User ID is required"));
          }

          const uploadData =
            uploadType === "multiple" ? req.fileBuffers : req.fileBuffer;
          const fileInfo =
            uploadType === "multiple" ? req.filesInfo : req.fileInfo;

          const result = await this.uploadService.uploadSingle(uploadData, {
            userType: userType,
            category: category,
            userId: userId,
            fileName: Array.isArray(fileInfo)
              ? fileInfo[0]?.originalName
              : fileInfo?.originalName,
            metadata: {
              fileInfo: fileInfo,
            },
          });

          req.uploadResult = result;
          next();
        } catch (error) {
          next(new ApiError(500, `Custom upload failed: ${error.message}`));
        }
      },
    ];
  }

  /**
   * Error handling middleware for upload errors
   */
  handleUploadError() {
    return (error, req, res, next) => {
      if (error instanceof multer.MulterError) {
        switch (error.code) {
          case "LIMIT_FILE_SIZE":
            return next(new ApiError(400, "File size too large"));
          case "LIMIT_FILE_COUNT":
            return next(new ApiError(400, "Too many files"));
          case "LIMIT_UNEXPECTED_FILE":
            return next(new ApiError(400, "Unexpected file field"));
          default:
            return next(new ApiError(400, `Upload error: ${error.message}`));
        }
      }
      next(error);
    };
  }
}

// Create singleton instance
const uploadMiddleware = new UploadMiddleware();

module.exports = uploadMiddleware;
