const UploadService = require("./services/upload.service");
const uploadController = require("./controllers/upload.controller");
const uploadRoutes = require("./routes/upload.routes");
const uploadMiddleware = require("./middleware/upload.middleware");
const {
  ProviderFactory,
  CloudinaryProvider,
  AWSProvider,
} = require("./providers");

/**
 * Upload Module
 * Provides modular file upload functionality with multiple cloud providers
 * Follows the established ShopStream module architecture patterns
 */
class UploadModule {
  constructor() {
    this.service = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the upload module
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      // Initialize upload service
      this.service = new UploadService();

      console.log(
        `Upload module initialized with provider: ${
          this.service.getProviderInfo().name
        }`
      );
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize upload module:", error.message);
      throw error;
    }
  }

  /**
   * Get module health status
   */
  getHealth() {
    return {
      module: "upload",
      status: this.isInitialized ? "healthy" : "not_initialized",
      provider: this.service ? this.service.getProviderInfo() : null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Shutdown the module
   */
  async shutdown() {
    try {
      console.log("Shutting down upload module...");
      this.isInitialized = false;
      this.service = null;
    } catch (error) {
      console.error("Error during upload module shutdown:", error.message);
      throw error;
    }
  }

  /**
   * Restart the module
   */
  async restart() {
    await this.shutdown();
    await this.initialize();
  }

  /**
   * Get upload service instance
   */
  getService() {
    if (!this.isInitialized) {
      throw new Error("Upload module not initialized");
    }
    return this.service;
  }

  /**
   * Switch upload provider
   */
  async switchProvider(providerName, providerConfig) {
    if (!this.isInitialized) {
      throw new Error("Upload module not initialized");
    }

    this.service.switchProvider(providerName, providerConfig);
    console.log(`Upload provider switched to: ${providerName}`);
  }
}

// Create module instance
const uploadModule = new UploadModule();

// Auto-initialize on module load
uploadModule.initialize().catch((error) => {
  console.error("Failed to auto-initialize upload module:", error.message);
});

module.exports = {
  // Module management
  uploadModule,
  initialize: () => uploadModule.initialize(),
  shutdown: () => uploadModule.shutdown(),
  restart: () => uploadModule.restart(),
  getHealth: () => uploadModule.getHealth(),

  // Core components
  service: uploadModule.getService.bind(uploadModule),
  controller: uploadController,
  routes: uploadRoutes,
  middleware: uploadMiddleware,

  // Providers
  providers: {
    ProviderFactory,
    CloudinaryProvider,
    AWSProvider,
  },

  // Utilities
  switchProvider: (providerName, config) =>
    uploadModule.switchProvider(providerName, config),
};
