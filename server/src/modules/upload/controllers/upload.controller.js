const UploadService = require("../services/upload.service");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const ApiError = require("../../../shared/utils/apiError");

/**
 * Upload Controller
 * Handles HTTP requests for file upload operations
 */
class UploadController {
  constructor() {
    this.uploadService = new UploadService();
  }

  /**
   * Upload user avatar
   */
  uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.uploadResult) {
      throw new ApiError(400, "Upload failed - no result available");
    }

    return res.success(
      { upload: req.uploadResult },
      "Avatar uploaded successfully"
    );
  });

  /**
   * Upload product images
   */
  uploadProductImages = asyncHandler(async (req, res) => {
    if (!req.uploadResult) {
      throw new ApiError(400, "Upload failed - no result available");
    }

    return res.success(
      { uploads: req.uploadResult },
      "Product images uploaded successfully"
    );
  });

  /**
   * Upload banner image
   */
  uploadBanner = asyncHandler(async (req, res) => {
    if (!req.uploadResult) {
      throw new ApiError(400, "Upload failed - no result available");
    }

    return res.success(
      { upload: req.uploadResult },
      "Banner uploaded successfully"
    );
  });

  /**
   * Upload category image
   */
  uploadCategoryImage = asyncHandler(async (req, res) => {
    if (!req.uploadResult) {
      throw new ApiError(400, "Upload failed - no result available");
    }

    return res.success(
      { upload: req.uploadResult },
      "Category image uploaded successfully"
    );
  });

  /**
   * Delete a file
   */
  deleteFile = asyncHandler(async (req, res) => {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    if (!publicId) {
      throw new ApiError(400, "Public ID is required");
    }

    const result = await this.uploadService.deleteFile(publicId, {
      resourceType: resourceType || "image",
    });

    return res.success({ result }, "File deleted successfully");
  });

  /**
   * Delete multiple files
   */
  deleteMultiple = asyncHandler(async (req, res) => {
    const { publicIds } = req.body;
    const { resourceType } = req.query;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      throw new ApiError(400, "Public IDs array is required");
    }

    const result = await this.uploadService.deleteMultiple(publicIds, {
      resourceType: resourceType || "image",
    });

    return res.success({ result }, "Files deleted successfully");
  });

  /**
   * Get file information
   */
  getFileInfo = asyncHandler(async (req, res) => {
    const { publicId } = req.params;

    if (!publicId) {
      throw new ApiError(400, "Public ID is required");
    }

    const result = await this.uploadService.getFileInfo(publicId);

    return res.success(
      { fileInfo: result },
      "File information retrieved successfully"
    );
  });

  /**
   * Generate signed URL for secure uploads
   */
  generateSignedUrl = asyncHandler(async (req, res) => {
    const {
      folder,
      fileName,
      contentType,
      transformation,
      resourceType,
      expiresAt,
    } = req.body;

    const options = {
      folder: folder || "general",
      fileName,
      contentType,
      transformation,
      resourceType: resourceType || "image",
      expiresAt,
    };

    const result = await this.uploadService.generateSignedUrl(options);

    return res.success(
      { signedUrl: result },
      "Signed URL generated successfully"
    );
  });

  /**
   * Transform an existing image
   */
  transformImage = asyncHandler(async (req, res) => {
    const { publicId } = req.params;
    const { transformation } = req.body;

    if (!publicId) {
      throw new ApiError(400, "Public ID is required");
    }

    if (!transformation || typeof transformation !== "object") {
      throw new ApiError(400, "Transformation options are required");
    }

    const result = await this.uploadService.transformImage(
      publicId,
      transformation
    );

    return res.success(
      { transformation: result },
      "Image transformed successfully"
    );
  });

  /**
   * Get provider information
   */
  getProviderInfo = asyncHandler(async (req, res) => {
    const providerInfo = this.uploadService.getProviderInfo();

    return res.success(
      { provider: providerInfo },
      "Provider information retrieved successfully"
    );
  });

  /**
   * Get upload statistics (Admin only)
   */
  getUploadStats = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    const stats = await this.uploadService.getUploadStats();

    return res.success({ stats }, "Upload statistics retrieved successfully");
  });

  /**
   * Get provider health status (Admin only)
   */
  getProviderHealth = asyncHandler(async (req, res) => {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    const health = await this.uploadService.getProviderHealth();

    return res.success(
      { health },
      "Provider health status retrieved successfully"
    );
  });

  /**
   * Switch upload provider (Admin only)
   */
  switchProvider = asyncHandler(async (req, res) => {
    const { providerName, providerConfig } = req.body;

    if (!providerName) {
      throw new ApiError(400, "Provider name is required");
    }

    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      throw new ApiError(403, "Admin access required");
    }

    this.uploadService.switchProvider(providerName, providerConfig);

    return res.success(
      {
        provider: this.uploadService.getProviderInfo(),
      },
      `Successfully switched to ${providerName} provider`
    );
  });

  /**
   * Custom upload endpoint
   */
  customUpload = asyncHandler(async (req, res) => {
    const {
      userType = "user",
      category = "general",
      fileName,
      transformation,
      metadata,
    } = req.body;

    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    if (!req.fileBuffer) {
      throw new ApiError(400, "No file uploaded");
    }

    const result = await this.uploadService.uploadSingle(req.fileBuffer, {
      userType,
      category,
      userId,
      fileName: fileName || req.fileInfo?.originalName,
      transformation,
      metadata: {
        ...metadata,
        originalName: req.fileInfo?.originalName,
        mimeType: req.fileInfo?.mimeType,
        size: req.fileInfo?.size,
      },
    });

    return res.success({ upload: result }, "File uploaded successfully");
  });

  /**
   * Bulk upload endpoint
   */
  bulkUpload = asyncHandler(async (req, res) => {
    const {
      userType = "user",
      category = "general",
      transformation,
      metadata,
    } = req.body;

    const userId = req.user?.id || req.params.userId;
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    if (!req.fileBuffers || req.fileBuffers.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    const results = await this.uploadService.uploadMultiple(req.fileBuffers, {
      userType,
      category,
      userId,
      transformation,
      metadata: {
        ...metadata,
        filesInfo: req.filesInfo,
      },
    });

    return res.success({ uploads: results }, "Files uploaded successfully");
  });

  /**
   * Upload brand logo
   */
  uploadBrandLogo = asyncHandler(async (req, res) => {
    const { brandId } = req.params;
    const userId = req.user?.id;

    if (!brandId) {
      throw new ApiError(400, "Brand ID is required");
    }
    if (!req.fileBuffer) {
      throw new ApiError(400, "No file uploaded");
    }

    const result = await this.uploadService.uploadBrandLogo(
      req.fileBuffer,
      userId,
      brandId,
      {
        fileName: req.fileInfo?.originalName,
        metadata: {
          originalName: req.fileInfo?.originalName,
          mimeType: req.fileInfo?.mimeType,
          size: req.fileInfo?.size,
        },
      }
    );

    return res.success({ upload: result }, "Brand logo uploaded successfully");
  });

  /**
   * Upload brand banner
   */
  uploadBrandBanner = asyncHandler(async (req, res) => {
    const { brandId } = req.params;
    const userId = req.user?.id;

    if (!brandId) {
      throw new ApiError(400, "Brand ID is required");
    }
    if (!req.fileBuffer) {
      throw new ApiError(400, "No file uploaded");
    }

    const result = await this.uploadService.uploadBrandBanner(
      req.fileBuffer,
      userId,
      brandId,
      {
        fileName: req.fileInfo?.originalName,
        metadata: {
          originalName: req.fileInfo?.originalName,
          mimeType: req.fileInfo?.mimeType,
          size: req.fileInfo?.size,
        },
      }
    );

    return res.success(
      { upload: result },
      "Brand banner uploaded successfully"
    );
  });

  /**
   * Upload brand gallery images
   */
  uploadBrandImages = asyncHandler(async (req, res) => {
    const { brandId } = req.params;
    const userId = req.user?.id;

    if (!brandId) {
      throw new ApiError(400, "Brand ID is required");
    }
    if (!req.fileBuffers || req.fileBuffers.length === 0) {
      throw new ApiError(400, "No files uploaded");
    }

    const results = await this.uploadService.uploadBrandImages(
      req.fileBuffers,
      userId,
      brandId,
      {
        metadata: {
          filesInfo: req.filesInfo,
        },
      }
    );

    return res.success(
      { uploads: results },
      "Brand images uploaded successfully"
    );
  });

  /**
   * Upload collection image
   */
  uploadCollectionImage = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;
    const userId = req.user?.id;

    if (!collectionId) {
      throw new ApiError(400, "Collection ID is required");
    }
    if (!req.fileBuffer) {
      throw new ApiError(400, "No file uploaded");
    }

    const result = await this.uploadService.uploadCollectionImage(
      req.fileBuffer,
      userId,
      collectionId,
      {
        fileName: req.fileInfo?.originalName,
        metadata: {
          originalName: req.fileInfo?.originalName,
          mimeType: req.fileInfo?.mimeType,
          size: req.fileInfo?.size,
        },
      }
    );

    return res.success(
      { upload: result },
      "Collection image uploaded successfully"
    );
  });
}

module.exports = new UploadController();
