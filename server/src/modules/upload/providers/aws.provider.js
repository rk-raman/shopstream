const BaseUploadProvider = require("./base.provider");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

/**
 * AWS S3 Upload Provider
 * Implements file upload functionality using AWS S3 service
 */
class AWSProvider extends BaseUploadProvider {
  constructor(config) {
    super(config);

    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });

    this.s3 = new AWS.S3();
    this.bucketName = config.bucketName;
  }

  /**
   * Upload a single file to S3
   */
  async uploadFile(file, options = {}) {
    try {
      const {
        folder = "general",
        fileName,
        publicId,
        contentType,
        acl = "public-read",
        metadata = {},
      } = options;

      // Generate unique key if not provided
      const fileExtension = fileName ? path.extname(fileName) : ".jpg";
      const finalKey =
        publicId || `${folder}/${fileName || uuidv4()}${fileExtension}`;

      let fileBuffer;
      let detectedContentType = contentType;

      // Handle different file input types
      if (Buffer.isBuffer(file)) {
        fileBuffer = file;
      } else if (typeof file === "string") {
        // Assume it's a file path
        const fs = require("fs");
        fileBuffer = fs.readFileSync(file);
        if (!detectedContentType) {
          detectedContentType = this._getContentTypeFromExtension(
            path.extname(file)
          );
        }
      } else {
        throw new Error("Invalid file input. Expected Buffer or string.");
      }

      // Auto-detect content type if not provided
      if (!detectedContentType) {
        detectedContentType = "application/octet-stream";
      }

      const uploadParams = {
        Bucket: this.bucketName,
        Key: finalKey,
        Body: fileBuffer,
        ContentType: detectedContentType,
        ACL: acl,
        Metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          provider: "aws-s3",
        },
      };

      const result = await this.s3.upload(uploadParams).promise();

      return {
        success: true,
        publicId: finalKey,
        url: result.Location,
        key: result.Key,
        etag: result.ETag,
        bucket: result.Bucket,
        contentType: detectedContentType,
        provider: "aws-s3",
      };
    } catch (error) {
      throw new Error(`AWS S3 upload failed: ${error.message}`);
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
   * Delete a file from S3
   */
  async deleteFile(publicId, options = {}) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: publicId,
      };

      const result = await this.s3.deleteObject(deleteParams).promise();

      return {
        success: true,
        publicId: publicId,
        result: "deleted",
        provider: "aws-s3",
      };
    } catch (error) {
      throw new Error(`AWS S3 delete failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(publicIds, options = {}) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Delete: {
          Objects: publicIds.map((key) => ({ Key: key })),
          Quiet: false,
        },
      };

      const result = await this.s3.deleteObjects(deleteParams).promise();

      return {
        success: true,
        deleted: result.Deleted,
        errors: result.Errors,
        provider: "aws-s3",
      };
    } catch (error) {
      throw new Error(`AWS S3 multiple delete failed: ${error.message}`);
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(publicId) {
    try {
      const headParams = {
        Bucket: this.bucketName,
        Key: publicId,
      };

      const result = await this.s3.headObject(headParams).promise();

      return {
        success: true,
        publicId: publicId,
        url: `https://${this.bucketName}.s3.${this.config.region}.amazonaws.com/${publicId}`,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        etag: result.ETag,
        lastModified: result.LastModified,
        metadata: result.Metadata,
        provider: "aws-s3",
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
        fileName,
        contentType = "image/jpeg",
        expires = 3600, // 1 hour
        acl = "public-read",
      } = options;

      const key = `${folder}/${fileName || uuidv4()}`;

      const signedUrlParams = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expires,
        ContentType: contentType,
        ACL: acl,
      };

      const signedUrl = await this.s3.getSignedUrlPromise(
        "putObject",
        signedUrlParams
      );

      return {
        success: true,
        url: signedUrl,
        key: key,
        expires: expires,
        provider: "aws-s3",
      };
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Transform/resize an existing image (Note: S3 doesn't have built-in transformation)
   */
  async transformImage(publicId, transformation = {}) {
    // AWS S3 doesn't have built-in image transformation
    // This would typically integrate with AWS Lambda or CloudFront for image processing
    throw new Error(
      "Image transformation not supported by AWS S3 provider. Consider using AWS Lambda or CloudFront for image processing."
    );
  }

  /**
   * Validate AWS configuration
   */
  validateConfig() {
    const required = ["accessKeyId", "secretAccessKey", "region", "bucketName"];
    const missing = required.filter((key) => !this.config[key]);

    if (missing.length > 0) {
      throw new Error(`Missing AWS configuration: ${missing.join(", ")}`);
    }

    return true;
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return "aws-s3";
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key) {
    return `https://${this.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  /**
   * Generate presigned URL for downloading
   */
  async getDownloadUrl(key, expires = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expires,
      };

      const url = await this.s3.getSignedUrlPromise("getObject", params);
      return {
        success: true,
        url: url,
        expires: expires,
        provider: "aws-s3",
      };
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Helper method to get content type from file extension
   */
  _getContentTypeFromExtension(extension) {
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
    };

    return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
  }
}

module.exports = AWSProvider;
