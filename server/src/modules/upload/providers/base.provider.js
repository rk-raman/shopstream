/**
 * Base Upload Provider Interface
 * All upload providers must extend this class and implement its methods
 */
class BaseUploadProvider {
  constructor(config) {
    this.config = config;
  }

  /**
   * Upload a single file
   * @param {Buffer|string} file - File buffer or file path
   * @param {Object} options - Upload options
   * @param {string} options.folder - Upload folder/directory
   * @param {string} options.fileName - Custom file name
   * @param {string} options.publicId - Custom public ID
   * @param {Object} options.transformation - Image transformation options
   * @returns {Promise<Object>} Upload result with url, publicId, etc.
   */
  async uploadFile(file, options = {}) {
    throw new Error("uploadFile method must be implemented by provider");
  }

  /**
   * Upload multiple files
   * @param {Array} files - Array of files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultiple(files, options = {}) {
    throw new Error("uploadMultiple method must be implemented by provider");
  }

  /**
   * Delete a file
   * @param {string} publicId - Public ID or identifier of the file
   * @param {Object} options - Delete options
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(publicId, options = {}) {
    throw new Error("deleteFile method must be implemented by provider");
  }

  /**
   * Delete multiple files
   * @param {Array} publicIds - Array of public IDs
   * @param {Object} options - Delete options
   * @returns {Promise<Array>} Array of delete results
   */
  async deleteMultiple(publicIds, options = {}) {
    throw new Error("deleteMultiple method must be implemented by provider");
  }

  /**
   * Get file information
   * @param {string} publicId - Public ID of the file
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(publicId) {
    throw new Error("getFileInfo method must be implemented by provider");
  }

  /**
   * Generate a signed URL for secure uploads
   * @param {Object} options - URL generation options
   * @returns {Promise<Object>} Signed URL and parameters
   */
  async generateSignedUrl(options = {}) {
    throw new Error("generateSignedUrl method must be implemented by provider");
  }

  /**
   * Transform/resize an existing image
   * @param {string} publicId - Public ID of the image
   * @param {Object} transformation - Transformation options
   * @returns {Promise<Object>} Transformed image result
   */
  async transformImage(publicId, transformation = {}) {
    throw new Error("transformImage method must be implemented by provider");
  }

  /**
   * Get provider-specific configuration
   * @returns {Object} Provider configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Validate provider configuration
   * @returns {boolean} True if configuration is valid
   */
  validateConfig() {
    throw new Error("validateConfig method must be implemented by provider");
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    throw new Error("getProviderName method must be implemented by provider");
  }
}

module.exports = BaseUploadProvider;
