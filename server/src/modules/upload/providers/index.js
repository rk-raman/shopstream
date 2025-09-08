const CloudinaryProvider = require("./cloudinary.provider");
const AWSProvider = require("./aws.provider");

/**
 * Upload Provider Factory
 * Creates and manages different upload providers
 */
class ProviderFactory {
  static providers = {
    cloudinary: CloudinaryProvider,
    aws: AWSProvider,
    s3: AWSProvider, // Alias for AWS
  };

  /**
   * Create a provider instance
   * @param {string} providerName - Name of the provider (cloudinary, aws, s3)
   * @param {Object} config - Provider configuration
   * @returns {BaseUploadProvider} Provider instance
   */
  static createProvider(providerName, config) {
    const ProviderClass = this.providers[providerName.toLowerCase()];

    if (!ProviderClass) {
      throw new Error(
        `Unsupported upload provider: ${providerName}. Supported providers: ${Object.keys(
          this.providers
        ).join(", ")}`
      );
    }

    const provider = new ProviderClass(config);

    // Validate configuration
    provider.validateConfig();

    return provider;
  }

  /**
   * Get list of supported providers
   * @returns {Array} List of supported provider names
   */
  static getSupportedProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Register a new provider
   * @param {string} name - Provider name
   * @param {Class} ProviderClass - Provider class
   */
  static registerProvider(name, ProviderClass) {
    this.providers[name.toLowerCase()] = ProviderClass;
  }
}

module.exports = {
  ProviderFactory,
  CloudinaryProvider,
  AWSProvider,
};
