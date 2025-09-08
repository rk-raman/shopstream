const { uploadEventEmitter, UPLOAD_EVENTS } = require("../upload.events");

class UploadEventPublisher {
  constructor() {
    this.eventEmitter = uploadEventEmitter;
  }

  // File upload events
  async publishFileUploaded(data) {
    try {
      this.eventEmitter.emitFileUploaded({
        uploadId: data.uploadId,
        userId: data.userId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        category: data.category,
        provider: data.provider,
        url: data.url,
        publicId: data.publicId,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file uploaded event:", error);
    }
  }

  async publishFileUploadFailed(data) {
    try {
      this.eventEmitter.emitFileUploadFailed({
        userId: data.userId,
        fileName: data.fileName,
        error: data.error,
        reason: data.reason,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file upload failed event:", error);
    }
  }

  async publishMultipleFilesUploaded(data) {
    try {
      this.eventEmitter.emitMultipleFilesUploaded({
        userId: data.userId,
        uploadIds: data.uploadIds,
        fileCount: data.fileCount,
        totalSize: data.totalSize,
        category: data.category,
        provider: data.provider,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing multiple files uploaded event:", error);
    }
  }

  // File management events
  async publishFileDeleted(data) {
    try {
      this.eventEmitter.emitFileDeleted({
        uploadId: data.uploadId,
        userId: data.userId,
        publicId: data.publicId,
        fileName: data.fileName,
        provider: data.provider,
        deletedBy: data.deletedBy,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file deleted event:", error);
    }
  }

  async publishFileDeleteFailed(data) {
    try {
      this.eventEmitter.emitFileDeleteFailed({
        uploadId: data.uploadId,
        publicId: data.publicId,
        error: data.error,
        reason: data.reason,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file delete failed event:", error);
    }
  }

  async publishMultipleFilesDeleted(data) {
    try {
      this.eventEmitter.emitMultipleFilesDeleted({
        userId: data.userId,
        uploadIds: data.uploadIds,
        publicIds: data.publicIds,
        fileCount: data.fileCount,
        deletedBy: data.deletedBy,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing multiple files deleted event:", error);
    }
  }

  // File access events
  async publishFileViewed(data) {
    try {
      this.eventEmitter.emitFileViewed({
        uploadId: data.uploadId,
        userId: data.userId,
        viewedBy: data.viewedBy,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file viewed event:", error);
    }
  }

  async publishFileDownloaded(data) {
    try {
      this.eventEmitter.emitFileDownloaded({
        uploadId: data.uploadId,
        userId: data.userId,
        downloadedBy: data.downloadedBy,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file downloaded event:", error);
    }
  }

  async publishFileAccessed(data) {
    try {
      this.eventEmitter.emitFileAccessed({
        uploadId: data.uploadId,
        userId: data.userId,
        accessedBy: data.accessedBy,
        accessType: data.accessType,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file accessed event:", error);
    }
  }

  // File transformation events
  async publishFileTransformed(data) {
    try {
      this.eventEmitter.emitFileTransformed({
        uploadId: data.uploadId,
        originalPublicId: data.originalPublicId,
        transformedPublicId: data.transformedPublicId,
        transformation: data.transformation,
        userId: data.userId,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing file transformed event:", error);
    }
  }

  async publishTransformationFailed(data) {
    try {
      this.eventEmitter.emitTransformationFailed({
        uploadId: data.uploadId,
        publicId: data.publicId,
        transformation: data.transformation,
        error: data.error,
        reason: data.reason,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing transformation failed event:", error);
    }
  }

  // Provider events
  async publishProviderSwitched(data) {
    try {
      this.eventEmitter.emitProviderSwitched({
        previousProvider: data.previousProvider,
        newProvider: data.newProvider,
        switchedBy: data.switchedBy,
        reason: data.reason,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing provider switched event:", error);
    }
  }

  async publishProviderError(data) {
    try {
      this.eventEmitter.emitProviderError({
        provider: data.provider,
        operation: data.operation,
        error: data.error,
        affectedFiles: data.affectedFiles,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing provider error event:", error);
    }
  }

  // Storage events
  async publishStorageQuotaWarning(data) {
    try {
      this.eventEmitter.emitStorageQuotaWarning({
        userId: data.userId,
        currentUsage: data.currentUsage,
        quotaLimit: data.quotaLimit,
        usagePercentage: data.usagePercentage,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing storage quota warning event:", error);
    }
  }

  async publishStorageQuotaExceeded(data) {
    try {
      this.eventEmitter.emitStorageQuotaExceeded({
        userId: data.userId,
        currentUsage: data.currentUsage,
        quotaLimit: data.quotaLimit,
        exceededBy: data.exceededBy,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing storage quota exceeded event:", error);
    }
  }

  // Security events
  async publishSuspiciousUpload(data) {
    try {
      this.eventEmitter.emitSuspiciousUpload({
        userId: data.userId,
        fileName: data.fileName,
        suspiciousIndicators: data.suspiciousIndicators,
        riskLevel: data.riskLevel,
        ipAddress: data.ipAddress,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing suspicious upload event:", error);
    }
  }

  async publishMalwareDetected(data) {
    try {
      this.eventEmitter.emitMalwareDetected({
        userId: data.userId,
        fileName: data.fileName,
        malwareType: data.malwareType,
        scanResult: data.scanResult,
        quarantined: data.quarantined,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing malware detected event:", error);
    }
  }

  // Analytics events
  async publishUploadAnalytics(data) {
    try {
      this.eventEmitter.emitUploadAnalytics({
        userId: data.userId,
        category: data.category,
        fileType: data.fileType,
        fileSize: data.fileSize,
        provider: data.provider,
        processingTime: data.processingTime,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing upload analytics event:", error);
    }
  }

  async publishUsageStats(data) {
    try {
      this.eventEmitter.emitUsageStats({
        userId: data.userId,
        period: data.period,
        totalUploads: data.totalUploads,
        totalSize: data.totalSize,
        categories: data.categories,
        providers: data.providers,
        ...data,
      });
    } catch (error) {
      console.error("Error publishing usage stats event:", error);
    }
  }
}

module.exports = { UploadEventPublisher };
