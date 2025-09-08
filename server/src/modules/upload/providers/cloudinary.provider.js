const BaseUploadProvider = require("./base.provider");
const cloudinary = require("cloudinary").v2;
const config = require("../../../config");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

/**
 * Cloudinary Upload Provider
 * Implements file upload functionality using Cloudinary service
 */
class CloudinaryProvider extends BaseUploadProvider {
  constructor(config) {
    super(config);

    // Configure cloudinary
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });

    this.cloudinary = cloudinary;
  }

  /**
   * Upload a single file to Cloudinary
   */
  async uploadFile(file, options = {}) {
    try {
      const {
        folder = "general",
        fileName,
        publicId,
        transformation = {},
        resourceType = "image",
        quality = "auto",
        format = "auto",
      } = options;

      // Generate unique public ID if not provided
      const finalPublicId = publicId || `${folder}/${fileName || uuidv4()}`;

      const uploadOptions = {
        public_id: finalPublicId,
        folder: folder,
        resource_type: resourceType,
        quality: quality,
        format: format,
        transformation: transformation,
        overwrite: false,
        unique_filename: !publicId,
        use_filename: !!fileName,
      };

      let result;

      // Handle different file input types
      if (Buffer.isBuffer(file)) {
        // Upload from buffer
        result = await new Promise((resolve, reject) => {
          this.cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(file);
        });
      } else if (typeof file === "string") {
        // Upload from file path or base64
        result = await this.cloudinary.uploader.upload(file, uploadOptions);
      } else {
        throw new Error("Invalid file input. Expected Buffer or string.");
      }

      return {
        success: true,
        publicId: result.public_id,
        url: result.secure_url,
        originalUrl: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        resourceType: result.resource_type,
        createdAt: result.created_at,
        etag: result.etag,
        version: result.version,
        signature: result.signature,
        folder: result.folder,
        provider: "cloudinary",
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files, options = {}) {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileOptions = {
          ...options,
          fileName: options.fileName
            ? `${options.fileName}_${index + 1}`
            : undefined,
        };
        return this.uploadFile(file, fileOptions);
      });

      const results = await Promise.allSettled(uploadPromises);

      return results.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        } else {
          return {
            success: false,
            error: result.reason.message,
            index: index,
          };
        }
      });
    } catch (error) {
      throw new Error(`Multiple upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId, options = {}) {
    try {
      const { resourceType = "image", invalidate = true } = options;

      const result = await this.cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: invalidate,
      });

      return {
        success: result.result === "ok",
        publicId: publicId,
        result: result.result,
        provider: "cloudinary",
      };
    } catch (error) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(publicIds, options = {}) {
    try {
      const { resourceType = "image", invalidate = true } = options;

      const result = await this.cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
        invalidate: invalidate,
      });

      return {
        success: true,
        deleted: result.deleted,
        deletedCounts: result.deleted_counts,
        partial: result.partial,
        provider: "cloudinary",
      };
    } catch (error) {
      throw new Error(`Cloudinary multiple delete failed: ${error.message}`);
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(publicId) {
    try {
      const result = await this.cloudinary.api.resource(publicId);

      return {
        success: true,
        publicId: result.public_id,
        url: result.secure_url,
        originalUrl: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        resourceType: result.resource_type,
        createdAt: result.created_at,
        folder: result.folder,
        version: result.version,
        provider: "cloudinary",
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for secure uploads
   */
  async generateSignedUrl(options = {}) {
    try {
      const {
        folder = "general",
        transformation = {},
        resourceType = "image",
        expiresAt,
      } = options;

      const timestamp = Math.round(new Date().getTime() / 1000);
      const params = {
        timestamp: timestamp,
        folder: folder,
        resource_type: resourceType,
        ...transformation,
      };

      if (expiresAt) {
        params.expires_at = expiresAt;
      }

      const signature = this.cloudinary.utils.api_sign_request(
        params,
        this.config.apiSecret
      );

      return {
        success: true,
        url: `https://api.cloudinary.com/v1_1/${this.config.cloudName}/${resourceType}/upload`,
        params: {
          ...params,
          signature: signature,
          api_key: this.config.apiKey,
        },
        provider: "cloudinary",
      };
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Transform an existing image
   */
  async transformImage(publicId, transformation = {}) {
    try {
      const transformedUrl = this.cloudinary.url(publicId, {
        ...transformation,
        secure: true,
      });

      return {
        success: true,
        publicId: publicId,
        transformedUrl: transformedUrl,
        transformation: transformation,
        provider: "cloudinary",
      };
    } catch (error) {
      throw new Error(`Image transformation failed: ${error.message}`);
    }
  }

  /**
   * Validate Cloudinary configuration
   */
  validateConfig() {
    const required = ["cloudName", "apiKey", "apiSecret"];
    const missing = required.filter((key) => !this.config[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing Cloudinary configuration: ${missing.join(", ")}`
      );
    }

    return true;
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return "cloudinary";
  }

  /**
   * Get upload URL for direct uploads
   */
  getUploadUrl(resourceType = "image") {
    return `https://api.cloudinary.com/v1_1/${this.config.cloudName}/${resourceType}/upload`;
  }

  /**
   * Generate transformation URL for existing image
   */
  getTransformationUrl(publicId, transformation = {}) {
    return this.cloudinary.url(publicId, {
      ...transformation,
      secure: true,
    });
  }
}

module.exports = CloudinaryProvider;
