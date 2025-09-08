const uploadService = require("./services/upload.service");
const uploadController = require("./controllers/upload.controller");
const uploadRoutes = require("./routes/upload.routes");
const uploadMiddleware = require("./middleware/upload.middleware");
const uploadValidators = require("./validators/upload.validators");
const { Upload } = require("./models");
const {
  uploadEventEmitter,
  UploadEventPublisher,
  UPLOAD_EVENTS,
} = require("./events/upload.events");
const UploadEventPublisher = require("./events/publishers/UploadEventPublisher");
const uploadSubscriberManager = require("./events/subscribers");

// Providers
const CloudinaryProvider = require("./providers/CloudinaryProvider");
const AWSProvider = require("./providers/AWSProvider");

class UploadModule {
  constructor() {
    this.name = "UploadModule";
    this.version = "1.0.0";
    this.isInitialized = false;
    this.eventPublisher = null;
  }

  async initialize() {
    try {
      if (this.isInitialized) {
        console.log("Upload module already initialized");
        return;
      }

      console.log("Initializing upload module...");

      // Initialize event publisher
      this.eventPublisher = new UploadEventPublisher(uploadEventEmitter);

      // Initialize event subscribers
      await uploadSubscriberManager.initialize(uploadEventEmitter);

      this.isInitialized = true;
      console.log("Upload module initialized successfully");

      // Emit module initialization event
      await this.eventPublisher.publishModuleInitialized({
        moduleName: this.name,
        version: this.version,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error initializing upload module:", error);
      throw error;
    }
  }

  async shutdown() {
    try {
      if (!this.isInitialized) {
        console.log("Upload module not initialized, nothing to shutdown");
        return;
      }

      console.log("Shutting down upload module...");

      // Emit module shutdown event
      if (this.eventPublisher) {
        await this.eventPublisher.publishModuleShutdown({
          moduleName: this.name,
          timestamp: new Date(),
        });
      }

      // Shutdown event subscribers
      await uploadSubscriberManager.shutdown();

      this.isInitialized = false;
      console.log("Upload module shut down successfully");
    } catch (error) {
      console.error("Error shutting down upload module:", error);
      throw error;
    }
  }

  async restart() {
    await this.shutdown();
    await this.initialize();
  }

  getHealthStatus() {
    return {
      module: this.name,
      version: this.version,
      isInitialized: this.isInitialized,
      eventSystem: {
        publisher: !!this.eventPublisher,
        subscribers: uploadSubscriberManager.getHealthStatus(),
      },
      providers: {
        cloudinary: CloudinaryProvider.isConfigured(),
        aws: AWSProvider.isConfigured(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  isHealthy() {
    return this.isInitialized && uploadSubscriberManager.isHealthy();
  }

  getModuleInfo() {
    return {
      name: this.name,
      version: this.version,
      description: "Upload management module with multi-provider support",
      features: [
        "Multi-provider support (Cloudinary, AWS S3)",
        "Role-based upload permissions",
        "Image transformations",
        "File validation and security",
        "Event-driven architecture",
        "Analytics and monitoring",
      ],
      providers: ["cloudinary", "aws"],
      supportedFormats: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "pdf",
        "doc",
        "docx",
      ],
    };
  }
}

// Create module instance
const uploadModule = new UploadModule();

// Auto-initialize the module
uploadModule.initialize().catch((error) => {
  console.error("Failed to auto-initialize upload module:", error);
});

// Export everything
module.exports = {
  // Core components
  uploadService,
  uploadController,
  uploadRoutes,
  uploadMiddleware,
  uploadValidators,

  // Models
  Upload,

  // Events
  uploadEventEmitter,
  UploadEventPublisher,
  UPLOAD_EVENTS,
  uploadSubscriberManager,

  // Providers
  CloudinaryProvider,
  AWSProvider,

  // Module management
  uploadModule,
  initialize: uploadModule.initialize.bind(uploadModule),
  shutdown: uploadModule.shutdown.bind(uploadModule),
  restart: uploadModule.restart.bind(uploadModule),
  getHealthStatus: uploadModule.getHealthStatus.bind(uploadModule),
  isHealthy: uploadModule.isHealthy.bind(uploadModule),
  getModuleInfo: uploadModule.getModuleInfo.bind(uploadModule),
};
