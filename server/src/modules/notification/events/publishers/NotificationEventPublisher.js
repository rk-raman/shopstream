/**
 * Notification Event Publisher
 *
 * Centralized class for publishing notification-related events
 * Handles event validation and consistent event structure
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const {
  NOTIFICATION_EVENTS,
  validateEventPayload,
} = require("../../../../shared/events/eventDefinitions");

class NotificationEventPublisher {
  constructor() {
    this.eventEmitter = eventEmitter;
  }

  /**
   * Publish notification created event
   */
  async publishNotificationCreated(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      type: notificationData.type,
      category: notificationData.category,
      channels: notificationData.channels,
      priority: notificationData.priority,
      scheduledAt: notificationData.scheduledAt,
      expiresAt: notificationData.expiresAt,
      timestamp: new Date().toISOString(),
      metadata: {
        source: notificationData.metadata?.source || "system",
        triggerEvent: notificationData.metadata?.triggerEvent,
        createdBy: notificationData.metadata?.createdBy,
      },
    };

    // Validate event payload
    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_CREATED.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_CREATED.name,
      eventData
    );
  }

  /**
   * Publish notification sent event
   */
  async publishNotificationSent(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      type: notificationData.type,
      channels: notificationData.channels,
      results: notificationData.results,
      timestamp: new Date().toISOString(),
      metadata: {
        deliveryAttempts: notificationData.deliveryAttempts,
        successCount: notificationData.successCount,
        failureCount: notificationData.failureCount,
      },
    };

    validateEventPayload(NOTIFICATION_EVENTS.NOTIFICATION_SENT.name, eventData);

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_SENT.name,
      eventData
    );
  }

  /**
   * Publish notification delivered event
   */
  async publishNotificationDelivered(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      channel: notificationData.channel,
      timestamp: new Date().toISOString(),
      metadata: {
        deliveryTime: notificationData.deliveryTime,
        deviceInfo: notificationData.deviceInfo,
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_DELIVERED.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_DELIVERED.name,
      eventData
    );
  }

  /**
   * Publish notification read event
   */
  async publishNotificationRead(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      readAt: notificationData.readAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      metadata: {
        readMethod: notificationData.readMethod || "in_app",
        deviceInfo: notificationData.deviceInfo,
      },
    };

    validateEventPayload(NOTIFICATION_EVENTS.NOTIFICATION_READ.name, eventData);

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_READ.name,
      eventData
    );
  }

  /**
   * Publish notification clicked event
   */
  async publishNotificationClicked(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      actionUrl: notificationData.actionUrl,
      actionText: notificationData.actionText,
      clickedAt: notificationData.clickedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      metadata: {
        clickMethod: notificationData.clickMethod || "in_app",
        deviceInfo: notificationData.deviceInfo,
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_CLICKED.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_CLICKED.name,
      eventData
    );
  }

  /**
   * Publish notification dismissed event
   */
  async publishNotificationDismissed(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      dismissedAt: notificationData.dismissedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      metadata: {
        dismissMethod: notificationData.dismissMethod || "user_action",
        deviceInfo: notificationData.deviceInfo,
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_DISMISSED.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_DISMISSED.name,
      eventData
    );
  }

  /**
   * Publish notification failed event
   */
  async publishNotificationFailed(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      channel: notificationData.channel,
      error: notificationData.error,
      failedAt: notificationData.failedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      metadata: {
        deliveryAttempts: notificationData.deliveryAttempts,
        retryCount: notificationData.retryCount,
        errorCode: notificationData.errorCode,
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_FAILED.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_FAILED.name,
      eventData
    );
  }

  /**
   * Publish notification expired event
   */
  async publishNotificationExpired(notificationData) {
    const eventData = {
      notificationId: notificationData.notificationId || notificationData._id,
      recipient: notificationData.recipient,
      expiredAt: notificationData.expiredAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      metadata: {
        originalExpiry: notificationData.originalExpiry,
        cleanupMethod: notificationData.cleanupMethod || "automatic",
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_EXPIRED.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_EXPIRED.name,
      eventData
    );
  }

  /**
   * Publish template created event
   */
  async publishTemplateCreated(templateData) {
    const eventData = {
      templateId: templateData.templateId || templateData._id,
      name: templateData.name,
      type: templateData.type,
      category: templateData.category,
      channels: templateData.channels,
      timestamp: new Date().toISOString(),
      metadata: {
        createdBy: templateData.createdBy,
        version: templateData.version || 1,
        isDefault: templateData.isDefault || false,
      },
    };

    validateEventPayload(NOTIFICATION_EVENTS.TEMPLATE_CREATED.name, eventData);

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.TEMPLATE_CREATED.name,
      eventData
    );
  }

  /**
   * Publish template updated event
   */
  async publishTemplateUpdated(templateData) {
    const eventData = {
      templateId: templateData.templateId || templateData._id,
      name: templateData.name,
      type: templateData.type,
      changes: templateData.changes,
      timestamp: new Date().toISOString(),
      metadata: {
        updatedBy: templateData.updatedBy,
        version: templateData.version,
        previousVersion: templateData.previousVersion,
      },
    };

    validateEventPayload(NOTIFICATION_EVENTS.TEMPLATE_UPDATED.name, eventData);

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.TEMPLATE_UPDATED.name,
      eventData
    );
  }

  /**
   * Publish template deleted event
   */
  async publishTemplateDeleted(templateData) {
    const eventData = {
      templateId: templateData.templateId || templateData._id,
      name: templateData.name,
      type: templateData.type,
      deletedAt: templateData.deletedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      metadata: {
        deletedBy: templateData.deletedBy,
        usageCount: templateData.usageCount,
        lastUsed: templateData.lastUsed,
      },
    };

    validateEventPayload(NOTIFICATION_EVENTS.TEMPLATE_DELETED.name, eventData);

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.TEMPLATE_DELETED.name,
      eventData
    );
  }

  /**
   * Publish bulk notification event
   */
  async publishBulkNotificationSent(bulkData) {
    const eventData = {
      batchId: bulkData.batchId,
      totalNotifications: bulkData.totalNotifications,
      successfulCount: bulkData.successfulCount,
      failedCount: bulkData.failedCount,
      timestamp: new Date().toISOString(),
      metadata: {
        batchSize: bulkData.batchSize,
        delayBetweenBatches: bulkData.delayBetweenBatches,
        processingTime: bulkData.processingTime,
        templateId: bulkData.templateId,
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.BULK_NOTIFICATION_SENT.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.BULK_NOTIFICATION_SENT.name,
      eventData
    );
  }

  /**
   * Publish notification analytics event
   */
  async publishNotificationAnalytics(analyticsData) {
    const eventData = {
      notificationId: analyticsData.notificationId,
      recipient: analyticsData.recipient,
      eventType: analyticsData.eventType, // 'opened', 'clicked', 'dismissed'
      timestamp: new Date().toISOString(),
      metadata: {
        deviceInfo: analyticsData.deviceInfo,
        userAgent: analyticsData.userAgent,
        ipAddress: analyticsData.ipAddress,
        sessionId: analyticsData.sessionId,
        referrer: analyticsData.referrer,
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_ANALYTICS.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_ANALYTICS.name,
      eventData
    );
  }

  /**
   * Publish notification system health event
   */
  async publishNotificationSystemHealth(healthData) {
    const eventData = {
      status: healthData.status, // 'healthy', 'degraded', 'unhealthy'
      timestamp: new Date().toISOString(),
      metadata: {
        emailService: healthData.emailService,
        smsService: healthData.smsService,
        pushService: healthData.pushService,
        queueSize: healthData.queueSize,
        errorRate: healthData.errorRate,
        responseTime: healthData.responseTime,
      },
    };

    validateEventPayload(
      NOTIFICATION_EVENTS.NOTIFICATION_SYSTEM_HEALTH.name,
      eventData
    );

    return await this.eventEmitter.publish(
      NOTIFICATION_EVENTS.NOTIFICATION_SYSTEM_HEALTH.name,
      eventData
    );
  }
}

module.exports = NotificationEventPublisher;
