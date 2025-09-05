const { Notification, NotificationTemplate } = require("../models");
const ApiError = require("../../../shared/utils/apiError");
const emailService = require("./email.service");
const smsService = require("./sms.service");
const pushService = require("./push.service");
const NotificationEventPublisher = require("../events/publishers/NotificationEventPublisher");

// Initialize event publisher
const notificationEventPublisher = new NotificationEventPublisher();

// Create notification
const createNotification = async (notificationData) => {
  try {
    // If templateId is provided, render the template
    if (notificationData.templateId) {
      const template = await NotificationTemplate.findById(
        notificationData.templateId
      );
      if (!template) {
        throw new ApiError(404, "Notification template not found");
      }

      // Validate template variables
      const variableErrors = template.validateVariables(
        notificationData.templateData || {}
      );
      if (variableErrors.length > 0) {
        throw new ApiError(
          400,
          `Template validation failed: ${variableErrors.join(", ")}`
        );
      }

      // Render template content
      const renderedContent = template.renderContent(
        notificationData.templateData || {}
      );

      // Merge rendered content with notification data
      notificationData = {
        ...notificationData,
        ...renderedContent,
        channels: {
          ...template.channels,
          ...notificationData.channels,
        },
        priority: notificationData.priority || template.priority,
        type: notificationData.type || template.type,
        category: notificationData.category || template.category,
      };

      // Set default expiry from template
      if (!notificationData.expiresAt && template.defaultExpiry) {
        notificationData.expiresAt = new Date(
          Date.now() + template.defaultExpiry * 24 * 60 * 60 * 1000
        );
      }

      // Increment template usage
      await template.incrementUsage();
    }

    // Create notification
    const notification = await Notification.create(notificationData);

    // Publish event
    await notificationEventPublisher.publishNotificationCreated({
      notificationId: notification._id,
      recipient: notification.recipient,
      type: notification.type,
      channels: notification.channels,
    });

    // If auto-send is enabled, send immediately
    if (notificationData.autoSend !== false) {
      await sendNotification(notification._id);
    }

    return notification;
  } catch (error) {
    throw error;
  }
};

// Send notification through enabled channels
const sendNotification = async (notificationId) => {
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    if (notification.status === "sent" || notification.status === "cancelled") {
      return notification;
    }

    const results = {
      email: null,
      sms: null,
      push: null,
      inApp: null,
    };

    // Send email notification
    if (
      notification.channels.email.enabled &&
      !notification.channels.email.sent
    ) {
      try {
        results.email = await emailService.sendEmail({
          to: notification.recipient,
          subject: notification.subject || notification.title,
          html: notification.emailContent?.html,
          text: notification.emailContent?.text,
          attachments: notification.emailContent?.attachments,
        });

        await notification.markChannelAsSent("email", {
          emailId: results.email.messageId,
        });
      } catch (error) {
        await notification.markChannelAsFailed("email", error.message);
        results.email = { error: error.message };
      }
    }

    // Send SMS notification
    if (notification.channels.sms.enabled && !notification.channels.sms.sent) {
      try {
        results.sms = await smsService.sendSMS({
          to: notification.recipient,
          message: notification.smsContent?.message || notification.message,
        });

        await notification.markChannelAsSent("sms", {
          messageId: results.sms.messageId,
        });
      } catch (error) {
        await notification.markChannelAsFailed("sms", error.message);
        results.sms = { error: error.message };
      }
    }

    // Send push notification
    if (
      notification.channels.push.enabled &&
      !notification.channels.push.sent
    ) {
      try {
        results.push = await pushService.sendPushNotification({
          recipient: notification.recipient,
          title: notification.pushContent?.title || notification.title,
          body: notification.pushContent?.body || notification.message,
          icon: notification.pushContent?.icon,
          image: notification.pushContent?.image,
          actionUrl:
            notification.pushContent?.actionUrl || notification.actionUrl,
          actionText:
            notification.pushContent?.actionText || notification.actionText,
          data: notification.actionData,
        });

        await notification.markChannelAsSent("push", {
          deviceTokens: results.push.deviceTokens,
        });
      } catch (error) {
        await notification.markChannelAsFailed("push", error.message);
        results.push = { error: error.message };
      }
    }

    // Mark in-app notification as delivered
    if (notification.channels.inApp.enabled) {
      await notification.markAsDelivered();
      results.inApp = { delivered: true };
    }

    // Update notification status
    const allChannelsSent = Object.values(notification.channels).every(
      (channel) => !channel.enabled || channel.sent || channel.delivered
    );

    if (allChannelsSent) {
      notification.status = "sent";
      await notification.save();
    }

    // Publish event
    await notificationEventPublisher.publishNotificationSent({
      notificationId: notification._id,
      recipient: notification.recipient,
      results,
    });

    return { notification, results };
  } catch (error) {
    throw error;
  }
};

// Get notifications for a user
const getUserNotifications = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    unreadOnly = false,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const filter = { recipient: userId };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (unreadOnly) filter["channels.inApp.read"] = false;

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  return await Notification.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: "templateId",
  });
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.markAsRead();

  // Publish event
  await notificationEventPublisher.publishNotificationRead({
    notificationId: notification._id,
    recipient: userId,
  });

  return notification;
};

// Mark notification as clicked
const markAsClicked = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.markAsClicked();

  // Publish event
  await notificationEventPublisher.publishNotificationClicked({
    notificationId: notification._id,
    recipient: userId,
    actionUrl: notification.actionUrl,
  });

  return notification;
};

// Mark notification as dismissed
const markAsDismissed = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  await notification.markAsDismissed();

  // Publish event
  await notificationEventPublisher.publishNotificationDismissed({
    notificationId: notification._id,
    recipient: userId,
  });

  return notification;
};

// Bulk mark as read
const bulkMarkAsRead = async (notificationIds, userId) => {
  const result = await Notification.bulkMarkAsRead(notificationIds, userId);

  // Publish event for each notification
  for (const notificationId of notificationIds) {
    await notificationEventPublisher.publishNotificationRead({
      notificationId,
      recipient: userId,
    });
  }

  return result;
};

// Bulk delete notifications
const bulkDeleteNotifications = async (notificationIds, userId) => {
  const result = await Notification.bulkDelete(notificationIds, userId);

  // Publish event for each notification
  for (const notificationId of notificationIds) {
    await notificationEventPublisher.publishNotificationDismissed({
      notificationId,
      recipient: userId,
    });
  }

  return result;
};

// Get notification statistics
const getNotificationStats = async (userId) => {
  const stats = await Notification.getNotificationStats(userId);
  return (
    stats[0] || {
      total: 0,
      unread: 0,
      byType: [],
      byStatus: [],
    }
  );
};

// Create notification template
const createNotificationTemplate = async (templateData) => {
  try {
    const template = await NotificationTemplate.create(templateData);

    // Publish event
    await notificationEventPublisher.publishTemplateCreated({
      templateId: template._id,
      name: template.name,
      type: template.type,
      createdBy: template.metadata.createdBy,
    });

    return template;
  } catch (error) {
    throw error;
  }
};

// Update notification template
const updateNotificationTemplate = async (templateId, updateData) => {
  const template = await NotificationTemplate.findByIdAndUpdate(
    templateId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new ApiError(404, "Notification template not found");
  }

  // Publish event
  await notificationEventPublisher.publishTemplateUpdated({
    templateId: template._id,
    name: template.name,
    type: template.type,
    updatedBy: updateData.updatedBy,
  });

  return template;
};

// Get notification templates
const getNotificationTemplates = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    type,
    category,
    activeOnly = true,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  let filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (activeOnly) filter.isActive = true;
  if (search) {
    filter.$text = { $search: search };
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  return await NotificationTemplate.paginate(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
  });
};

// Get template by type
const getTemplateByType = async (type, isDefault = true) => {
  if (isDefault) {
    return await NotificationTemplate.findDefault(type);
  }

  const templates = await NotificationTemplate.findByType(type, {
    activeOnly: true,
  });
  return templates[0] || null;
};

// Send bulk notifications
const sendBulkNotifications = async (notificationsData, options = {}) => {
  const { batchSize = 100, delayBetweenBatches = 1000 } = options;

  const results = [];
  const batches = [];

  // Split into batches
  for (let i = 0; i < notificationsData.length; i += batchSize) {
    batches.push(notificationsData.slice(i, i + batchSize));
  }

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchResults = await Promise.allSettled(
      batch.map((data) => createNotification(data))
    );

    results.push(...batchResults);

    // Delay between batches (except for the last one)
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
};

// Process scheduled notifications
const processScheduledNotifications = async () => {
  const scheduledNotifications = await Notification.findScheduled();

  const results = await Promise.allSettled(
    scheduledNotifications.map((notification) =>
      sendNotification(notification._id)
    )
  );

  return results;
};

// Clean up expired notifications
const cleanupExpiredNotifications = async () => {
  const expiredNotifications = await Notification.findExpired();

  const results = await Promise.allSettled(
    expiredNotifications.map((notification) =>
      Notification.findByIdAndUpdate(notification._id, { status: "cancelled" })
    )
  );

  return results;
};

// Retry failed notifications
const retryFailedNotifications = async (maxAttempts = 3) => {
  const failedNotifications = await Notification.find({
    status: "failed",
    deliveryAttempts: { $lt: maxAttempts },
  });

  const results = await Promise.allSettled(
    failedNotifications.map((notification) => {
      notification.incrementDeliveryAttempts();
      return sendNotification(notification._id);
    })
  );

  return results;
};

module.exports = {
  // Notification CRUD operations
  createNotification,
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAsClicked,
  markAsDismissed,
  bulkMarkAsRead,
  bulkDeleteNotifications,
  getNotificationStats,

  // Template operations
  createNotificationTemplate,
  updateNotificationTemplate,
  getNotificationTemplates,
  getTemplateByType,

  // Bulk operations
  sendBulkNotifications,
  processScheduledNotifications,
  cleanupExpiredNotifications,
  retryFailedNotifications,
};
