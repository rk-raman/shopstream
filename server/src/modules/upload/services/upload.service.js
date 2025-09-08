const { CloudinaryProvider, AWSProvider } = require("../../providers");
const config = require("../../config");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

/**
 * Upload Service
 * Main service for handling file uploads with different providers
 * Supports different user types (user, seller, admin) and categories
 */
class UploadService {
  constructor() {
    this.provider = null;
    this.config = config.upload;
    this.initializeProvider();
  }

  /**
   * Initialize the upload provider based on configuration
   */
  initializeProvider() {
    try {
      const providerName = this.config.provider;
      let providerConfig;

      switch (providerName) {
        case "cloudinary":
          providerConfig = config.cloudinary;
          break;
        case "aws":
        case "s3":
          providerConfig = config.aws;
          break;
        default:
          throw new Error(`Unsupported provider: ${providerName}`);
      }

      this.provider = ProviderFactory.createProvider(
        providerName,
        providerConfig
      );
    } catch (error) {
      throw new Error(`Failed to initialize upload provider: ${error.message}`);
    }
  }

  /**
   * Upload a single file
   * @param {Buffer|string} file - File buffer or path
   * @param {Object} options - Upload options
   * @param {string} options.userType - Type of user (user, seller, admin)
   * @param {string} options.category - File category (avatar, product, banner, etc.)
   * @param {string} options.userId - User ID for organization
   * @param {string} options.fileName - Custom file name
   * @param {Object} options.metadata - Additional metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadSingle(file, options = {}) {
    try {
      this.validateFile(file, options);

      const {
        userType = "user",
        category = "general",
        userId,
        fileName,
        metadata = {},
        transformation = {},
      } = options;

      // Generate organized folder structure
      const folder = this.generateFolderPath(userType, category, userId);

      // Generate unique filename if not provided
      const finalFileName = fileName || this.generateFileName(category);

      const uploadOptions = {
        folder: folder,
        fileName: finalFileName,
        transformation: transformation,
        metadata: {
          ...metadata,
          userType: userType,
          category: category,
          userId: userId,
          uploadedAt: new Date().toISOString(),
        },
      };

      const result = await this.provider.uploadFile(file, uploadOptions);

      // Add service-level metadata
      return {
        ...result,
        userType: userType,
        category: category,
        userId: userId,
        folder: folder,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultiple(files, options = {}) {
    try {
      if (!Array.isArray(files) || files.length === 0) {
        throw new Error("Files array is required and must not be empty");
      }

      const uploadPromises = files.map((file, index) => {
        const fileOptions = {
          ...options,
          fileName: options.fileName
            ? `${options.fileName}_${index + 1}`
            : undefined,
        };
        return this.uploadSingle(file, fileOptions);
      });

      return await Promise.allSettled(uploadPromises);
    } catch (error) {
      throw new Error(`Multiple upload failed: ${error.message}`);
    }
  }

  /**
   * Upload user avatar
   * @param {Buffer|string} file - Avatar file
   * @param {string} userId - User ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadAvatar(file, userId, options = {}) {
    const avatarOptions = {
      ...options,
      userType: "user",
      category: "avatar",
      userId: userId,
      transformation: {
        width: 200,
        height: 200,
        crop: "fill",
        quality: "auto",
        format: "auto",
        ...options.transformation,
      },
    };

    return await this.uploadSingle(file, avatarOptions);
  }

  /**
   * Upload product images
   * @param {Array|Buffer|string} files - Product image files
   * @param {string} sellerId - Seller ID
   * @param {string} productId - Product ID (optional)
   * @param {Object} options - Additional options
   * @returns {Promise<Object|Array>} Upload result(s)
   */
  async uploadProductImages(files, sellerId, productId = null, options = {}) {
    const productOptions = {
      ...options,
      userType: "seller",
      category: "product",
      userId: sellerId,
      metadata: {
        productId: productId,
        ...options.metadata,
      },
      transformation: {
        width: 800,
        height: 600,
        crop: "fit",
        quality: "auto",
        format: "auto",
        ...options.transformation,
      },
    };

    if (Array.isArray(files)) {
      return await this.uploadMultiple(files, productOptions);
    } else {
      return await this.uploadSingle(files, productOptions);
    }
  }

  /**
   * Upload banner images (admin only)
   * @param {Buffer|string} file - Banner file
   * @param {string} adminId - Admin ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadBanner(file, adminId, options = {}) {
    const bannerOptions = {
      ...options,
      userType: "admin",
      category: "banner",
      userId: adminId,
      transformation: {
        width: 1200,
        height: 400,
        crop: "fill",
        quality: "auto",
        format: "auto",
        ...options.transformation,
      },
    };

    return await this.uploadSingle(file, bannerOptions);
  }

  /**
   * Upload category images
   * @param {Buffer|string} file - Category image file
   * @param {string} adminId - Admin ID
   * @param {string} categoryId - Category ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Upload result
   */
  async uploadCategoryImage(file, adminId, categoryId, options = {}) {
    const categoryOptions = {
      ...options,
      userType: "admin",
      category: "category",
      userId: adminId,
      metadata: {
        categoryId: categoryId,
        ...options.metadata,
      },
      transformation: {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "auto",
        ...options.transformation,
      },
    };

    return await this.uploadSingle(file, categoryOptions);
  }

  /**
   * Delete a file
   * @param {string} publicId - Public ID of the file
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(publicId, options = {}) {
    try {
      return await this.provider.deleteFile(publicId, options);
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   * @param {Array} publicIds - Array of public IDs
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Delete result
   */
  async deleteMultiple(publicIds, options = {}) {
    try {
      return await this.provider.deleteMultiple(publicIds, options);
    } catch (error) {
      throw new Error(`Multiple delete failed: ${error.message}`);
    }
  }

  /**
   * Get file information
   * @param {string} publicId - Public ID of the file
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(publicId) {
    try {
      return await this.provider.getFileInfo(publicId);
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for secure uploads
   * @param {Object} options - URL generation options
   * @returns {Promise<Object>} Signed URL and parameters
   */
  async generateSignedUrl(options = {}) {
    try {
      return await this.provider.generateSignedUrl(options);
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Transform an existing image
   * @param {string} publicId - Public ID of the image
   * @param {Object} transformation - Transformation options
   * @returns {Promise<Object>} Transformed image result
   */
  async transformImage(publicId, transformation = {}) {
    try {
      return await this.provider.transformImage(publicId, transformation);
    } catch (error) {
      throw new Error(`Image transformation failed: ${error.message}`);
    }
  }

  /**
   * Switch upload provider
   * @param {string} providerName - New provider name
   * @param {Object} providerConfig - New provider configuration
   */
  switchProvider(providerName, providerConfig) {
    try {
      this.provider = ProviderFactory.createProvider(
        providerName,
        providerConfig
      );
      this.config.provider = providerName;
    } catch (error) {
      throw new Error(`Failed to switch provider: ${error.message}`);
    }
  }

  /**
   * Get current provider information
   * @returns {Object} Provider information
   */
  getProviderInfo() {
    return {
      name: this.provider.getProviderName(),
      config: this.provider.getConfig(),
      supportedProviders: ProviderFactory.getSupportedProviders(),
    };
  }

  /**
   * Validate file before upload
   * @param {Buffer|string} file - File to validate
   * @param {Object} options - Validation options
   */
  validateFile(file, options = {}) {
    if (!file) {
      throw new Error("File is required");
    }

    // Validate file size if it's a buffer
    if (Buffer.isBuffer(file)) {
      if (file.length > this.config.maxFileSize) {
        throw new Error(
          `File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`
        );
      }
    }

    // Additional validations can be added here
    // e.g., MIME type validation, file extension validation, etc.
  }

  /**
   * Generate organized folder path
   * @param {string} userType - Type of user
   * @param {string} category - File category
   * @param {string} userId - User ID
   * @returns {string} Folder path
   */
  generateFolderPath(userType, category, userId) {
    const baseFolder = this.config.folders[category] || category;
    return `${baseFolder}/${userType}/${userId}`;
  }

  /**
   * Generate unique filename
   * @param {string} category - File category
   * @returns {string} Generated filename
   */
  generateFileName(category) {
    const timestamp = Date.now();
    const uuid = uuidv4().split("-")[0];
    return `${category}_${timestamp}_${uuid}`;
  }
}

module.exports = UploadService;
