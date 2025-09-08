const { EventEmitter } = require("events");

// Upload Event Types
const UPLOAD_EVENTS = {
  // File upload events
  FILE_UPLOADED: "upload.file.uploaded",
  FILE_UPLOAD_FAILED: "upload.file.failed",
  MULTIPLE_FILES_UPLOADED: "upload.multiple.uploaded",

  // File management events
  FILE_DELETED: "upload.file.deleted",
  FILE_DELETE_FAILED: "upload.file.delete.failed",
  MULTIPLE_FILES_DELETED: "upload.multiple.deleted",

  // File access events
  FILE_VIEWED: "upload.file.viewed",
  FILE_DOWNLOADED: "upload.file.downloaded",
  FILE_ACCESSED: "upload.file.accessed",

  // File transformation events
  FILE_TRANSFORMED: "upload.file.transformed",
  TRANSFORMATION_FAILED: "upload.transformation.failed",

  // Provider events
  PROVIDER_SWITCHED: "upload.provider.switched",
  PROVIDER_ERROR: "upload.provider.error",

  // Storage events
  STORAGE_QUOTA_WARNING: "upload.storage.quota.warning",
  STORAGE_QUOTA_EXCEEDED: "upload.storage.quota.exceeded",

  // Security events
  SUSPICIOUS_UPLOAD: "upload.security.suspicious",
  MALWARE_DETECTED: "upload.security.malware",

  // Analytics events
  UPLOAD_ANALYTICS: "upload.analytics",
  USAGE_STATS: "upload.usage.stats",
};

// Upload Event Emitter
class UploadEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  // File upload events
  emitFileUploaded(data) {
    this.emit(UPLOAD_EVENTS.FILE_UPLOADED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_UPLOADED,
    });
  }

  emitFileUploadFailed(data) {
    this.emit(UPLOAD_EVENTS.FILE_UPLOAD_FAILED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_UPLOAD_FAILED,
    });
  }

  emitMultipleFilesUploaded(data) {
    this.emit(UPLOAD_EVENTS.MULTIPLE_FILES_UPLOADED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.MULTIPLE_FILES_UPLOADED,
    });
  }

  // File management events
  emitFileDeleted(data) {
    this.emit(UPLOAD_EVENTS.FILE_DELETED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_DELETED,
    });
  }

  emitFileDeleteFailed(data) {
    this.emit(UPLOAD_EVENTS.FILE_DELETE_FAILED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_DELETE_FAILED,
    });
  }

  emitMultipleFilesDeleted(data) {
    this.emit(UPLOAD_EVENTS.MULTIPLE_FILES_DELETED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.MULTIPLE_FILES_DELETED,
    });
  }

  // File access events
  emitFileViewed(data) {
    this.emit(UPLOAD_EVENTS.FILE_VIEWED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_VIEWED,
    });
  }

  emitFileDownloaded(data) {
    this.emit(UPLOAD_EVENTS.FILE_DOWNLOADED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_DOWNLOADED,
    });
  }

  emitFileAccessed(data) {
    this.emit(UPLOAD_EVENTS.FILE_ACCESSED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_ACCESSED,
    });
  }

  // File transformation events
  emitFileTransformed(data) {
    this.emit(UPLOAD_EVENTS.FILE_TRANSFORMED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.FILE_TRANSFORMED,
    });
  }

  emitTransformationFailed(data) {
    this.emit(UPLOAD_EVENTS.TRANSFORMATION_FAILED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.TRANSFORMATION_FAILED,
    });
  }

  // Provider events
  emitProviderSwitched(data) {
    this.emit(UPLOAD_EVENTS.PROVIDER_SWITCHED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.PROVIDER_SWITCHED,
    });
  }

  emitProviderError(data) {
    this.emit(UPLOAD_EVENTS.PROVIDER_ERROR, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.PROVIDER_ERROR,
    });
  }

  // Storage events
  emitStorageQuotaWarning(data) {
    this.emit(UPLOAD_EVENTS.STORAGE_QUOTA_WARNING, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.STORAGE_QUOTA_WARNING,
    });
  }

  emitStorageQuotaExceeded(data) {
    this.emit(UPLOAD_EVENTS.STORAGE_QUOTA_EXCEEDED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.STORAGE_QUOTA_EXCEEDED,
    });
  }

  // Security events
  emitSuspiciousUpload(data) {
    this.emit(UPLOAD_EVENTS.SUSPICIOUS_UPLOAD, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.SUSPICIOUS_UPLOAD,
    });
  }

  emitMalwareDetected(data) {
    this.emit(UPLOAD_EVENTS.MALWARE_DETECTED, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.MALWARE_DETECTED,
    });
  }

  // Analytics events
  emitUploadAnalytics(data) {
    this.emit(UPLOAD_EVENTS.UPLOAD_ANALYTICS, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.UPLOAD_ANALYTICS,
    });
  }

  emitUsageStats(data) {
    this.emit(UPLOAD_EVENTS.USAGE_STATS, {
      ...data,
      timestamp: new Date(),
      eventType: UPLOAD_EVENTS.USAGE_STATS,
    });
  }
}

// Create singleton instance
const uploadEventEmitter = new UploadEventEmitter();

module.exports = {
  UPLOAD_EVENTS,
  uploadEventEmitter,
  UploadEventEmitter,
};
