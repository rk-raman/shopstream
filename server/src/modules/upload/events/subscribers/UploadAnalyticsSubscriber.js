const { UPLOAD_EVENTS } = require("../upload.events");

class UploadAnalyticsSubscriber {
  constructor() {
    this.name = "UploadAnalyticsSubscriber";
    this.isActive = false;
    this.eventEmitter = null;
    this.listeners = new Map();
  }

  async initialize(eventEmitter) {
    try {
      this.eventEmitter = eventEmitter;
      this.setupEventListeners();
      this.isActive = true;
      console.log(`${this.name} initialized successfully`);
    } catch (error) {
      console.error(`Error initializing ${this.name}:`, error);
      throw error;
    }
  }

  setupEventListeners() {
    // File upload analytics
    this.addListener(
      UPLOAD_EVENTS.FILE_UPLOADED,
      this.handleFileUploaded.bind(this)
    );
    this.addListener(
      UPLOAD_EVENTS.MULTIPLE_FILES_UPLOADED,
      this.handleMultipleFilesUploaded.bind(this)
    );
    this.addListener(
      UPLOAD_EVENTS.FILE_UPLOAD_FAILED,
      this.handleFileUploadFailed.bind(this)
    );

    // File access analytics
    this.addListener(
      UPLOAD_EVENTS.FILE_VIEWED,
      this.handleFileViewed.bind(this)
    );
    this.addListener(
      UPLOAD_EVENTS.FILE_DOWNLOADED,
      this.handleFileDownloaded.bind(this)
    );

    // File management analytics
    this.addListener(
      UPLOAD_EVENTS.FILE_DELETED,
      this.handleFileDeleted.bind(this)
    );
    this.addListener(
      UPLOAD_EVENTS.FILE_TRANSFORMED,
      this.handleFileTransformed.bind(this)
    );

    // Provider analytics
    this.addListener(
      UPLOAD_EVENTS.PROVIDER_SWITCHED,
      this.handleProviderSwitched.bind(this)
    );
    this.addListener(
      UPLOAD_EVENTS.PROVIDER_ERROR,
      this.handleProviderError.bind(this)
    );

    // Storage analytics
    this.addListener(
      UPLOAD_EVENTS.STORAGE_QUOTA_WARNING,
      this.handleStorageQuotaWarning.bind(this)
    );
    this.addListener(
      UPLOAD_EVENTS.STORAGE_QUOTA_EXCEEDED,
      this.handleStorageQuotaExceeded.bind(this)
    );

    // Security analytics
    this.addListener(
      UPLOAD_EVENTS.SUSPICIOUS_UPLOAD,
      this.handleSuspiciousUpload.bind(this)
    );
    this.addListener(
      UPLOAD_EVENTS.MALWARE_DETECTED,
      this.handleMalwareDetected.bind(this)
    );
  }

  addListener(eventType, handler) {
    this.eventEmitter.on(eventType, handler);
    this.listeners.set(eventType, handler);
  }

  // File upload analytics handlers
  async handleFileUploaded(data) {
    try {
      console.log(
        `[Analytics] File uploaded: ${data.fileName} by user ${data.userId}`
      );

      // Track upload metrics
      await this.trackUploadMetrics({
        userId: data.userId,
        category: data.category,
        fileSize: data.fileSize,
        provider: data.provider,
        format: data.format || this.extractFormat(data.fileName),
        uploadTime: data.timestamp,
        success: true,
      });

      // Track user activity
      await this.trackUserActivity({
        userId: data.userId,
        action: "file_upload",
        category: data.category,
        metadata: {
          fileName: data.fileName,
          fileSize: data.fileSize,
          provider: data.provider,
        },
      });

      // Track provider usage
      await this.trackProviderUsage({
        provider: data.provider,
        operation: "upload",
        fileSize: data.fileSize,
        success: true,
      });
    } catch (error) {
      console.error("Error handling file uploaded analytics:", error);
    }
  }

  async handleMultipleFilesUploaded(data) {
    try {
      console.log(
        `[Analytics] Multiple files uploaded: ${data.fileCount} files by user ${data.userId}`
      );

      await this.trackBulkUploadMetrics({
        userId: data.userId,
        fileCount: data.fileCount,
        totalSize: data.totalSize,
        category: data.category,
        provider: data.provider,
        uploadTime: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling multiple files uploaded analytics:", error);
    }
  }

  async handleFileUploadFailed(data) {
    try {
      console.log(
        `[Analytics] File upload failed: ${data.fileName} for user ${data.userId}`
      );

      await this.trackUploadMetrics({
        userId: data.userId,
        fileName: data.fileName,
        error: data.error,
        reason: data.reason,
        uploadTime: data.timestamp,
        success: false,
      });

      await this.trackErrorMetrics({
        type: "upload_failure",
        error: data.error,
        userId: data.userId,
        context: {
          fileName: data.fileName,
          reason: data.reason,
        },
      });
    } catch (error) {
      console.error("Error handling file upload failed analytics:", error);
    }
  }

  // File access analytics handlers
  async handleFileViewed(data) {
    try {
      await this.trackFileAccess({
        uploadId: data.uploadId,
        userId: data.userId,
        viewedBy: data.viewedBy,
        accessType: "view",
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling file viewed analytics:", error);
    }
  }

  async handleFileDownloaded(data) {
    try {
      await this.trackFileAccess({
        uploadId: data.uploadId,
        userId: data.userId,
        downloadedBy: data.downloadedBy,
        accessType: "download",
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling file downloaded analytics:", error);
    }
  }

  // File management analytics handlers
  async handleFileDeleted(data) {
    try {
      await this.trackFileDeletion({
        uploadId: data.uploadId,
        userId: data.userId,
        deletedBy: data.deletedBy,
        provider: data.provider,
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling file deleted analytics:", error);
    }
  }

  async handleFileTransformed(data) {
    try {
      await this.trackFileTransformation({
        uploadId: data.uploadId,
        userId: data.userId,
        transformation: data.transformation,
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling file transformed analytics:", error);
    }
  }

  // Provider analytics handlers
  async handleProviderSwitched(data) {
    try {
      await this.trackProviderSwitch({
        previousProvider: data.previousProvider,
        newProvider: data.newProvider,
        switchedBy: data.switchedBy,
        reason: data.reason,
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling provider switched analytics:", error);
    }
  }

  async handleProviderError(data) {
    try {
      await this.trackProviderError({
        provider: data.provider,
        operation: data.operation,
        error: data.error,
        affectedFiles: data.affectedFiles,
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling provider error analytics:", error);
    }
  }

  // Storage analytics handlers
  async handleStorageQuotaWarning(data) {
    try {
      await this.trackStorageUsage({
        userId: data.userId,
        currentUsage: data.currentUsage,
        quotaLimit: data.quotaLimit,
        usagePercentage: data.usagePercentage,
        alertType: "warning",
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling storage quota warning analytics:", error);
    }
  }

  async handleStorageQuotaExceeded(data) {
    try {
      await this.trackStorageUsage({
        userId: data.userId,
        currentUsage: data.currentUsage,
        quotaLimit: data.quotaLimit,
        exceededBy: data.exceededBy,
        alertType: "exceeded",
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling storage quota exceeded analytics:", error);
    }
  }

  // Security analytics handlers
  async handleSuspiciousUpload(data) {
    try {
      await this.trackSecurityEvent({
        userId: data.userId,
        eventType: "suspicious_upload",
        fileName: data.fileName,
        suspiciousIndicators: data.suspiciousIndicators,
        riskLevel: data.riskLevel,
        ipAddress: data.ipAddress,
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling suspicious upload analytics:", error);
    }
  }

  async handleMalwareDetected(data) {
    try {
      await this.trackSecurityEvent({
        userId: data.userId,
        eventType: "malware_detected",
        fileName: data.fileName,
        malwareType: data.malwareType,
        scanResult: data.scanResult,
        quarantined: data.quarantined,
        timestamp: data.timestamp,
      });
    } catch (error) {
      console.error("Error handling malware detected analytics:", error);
    }
  }

  // Analytics tracking methods (placeholder implementations)
  async trackUploadMetrics(data) {
    // Implementation would store metrics in analytics database
    console.log("Tracking upload metrics:", data);
  }

  async trackUserActivity(data) {
    // Implementation would track user behavior patterns
    console.log("Tracking user activity:", data);
  }

  async trackProviderUsage(data) {
    // Implementation would track provider performance and usage
    console.log("Tracking provider usage:", data);
  }

  async trackBulkUploadMetrics(data) {
    // Implementation would track bulk upload patterns
    console.log("Tracking bulk upload metrics:", data);
  }

  async trackErrorMetrics(data) {
    // Implementation would track error patterns and frequencies
    console.log("Tracking error metrics:", data);
  }

  async trackFileAccess(data) {
    // Implementation would track file access patterns
    console.log("Tracking file access:", data);
  }

  async trackFileDeletion(data) {
    // Implementation would track file deletion patterns
    console.log("Tracking file deletion:", data);
  }

  async trackFileTransformation(data) {
    // Implementation would track transformation usage
    console.log("Tracking file transformation:", data);
  }

  async trackProviderSwitch(data) {
    // Implementation would track provider switching patterns
    console.log("Tracking provider switch:", data);
  }

  async trackProviderError(data) {
    // Implementation would track provider reliability
    console.log("Tracking provider error:", data);
  }

  async trackStorageUsage(data) {
    // Implementation would track storage consumption patterns
    console.log("Tracking storage usage:", data);
  }

  async trackSecurityEvent(data) {
    // Implementation would track security incidents
    console.log("Tracking security event:", data);
  }

  // Utility methods
  extractFormat(fileName) {
    return fileName.split(".").pop().toLowerCase();
  }

  async shutdown() {
    try {
      if (this.eventEmitter && this.listeners.size > 0) {
        for (const [eventType, handler] of this.listeners) {
          this.eventEmitter.removeListener(eventType, handler);
        }
        this.listeners.clear();
      }
      this.isActive = false;
      console.log(`${this.name} shut down successfully`);
    } catch (error) {
      console.error(`Error shutting down ${this.name}:`, error);
      throw error;
    }
  }

  getHealthStatus() {
    return {
      name: this.name,
      isActive: this.isActive,
      listenerCount: this.listeners.size,
      lastActivity: new Date().toISOString(),
    };
  }
}

module.exports = UploadAnalyticsSubscriber;
