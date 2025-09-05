const notificationService = require("../services/notification.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Get user notifications
const getUserNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = 1,
    limit = 20,
    type,
    status,
    unreadOnly = false,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    status,
    unreadOnly: unreadOnly === "true",
    sortBy,
    sortOrder,
  };

  const notifications = await notificationService.getUserNotifications(
    userId,
    options
  );
  return res.paginated(notifications, "Notifications retrieved successfully");
});

// Get notification by ID
const getNotificationById = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.getUserNotifications(userId, {
    page: 1,
    limit: 1,
  });

  const foundNotification = notification.docs.find(
    (n) => n._id.toString() === notificationId
  );

  if (!foundNotification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.success(
    { notification: foundNotification },
    "Notification retrieved successfully"
  );
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.markAsRead(
    notificationId,
    userId
  );
  return res.success({ notification }, "Notification marked as read");
});

// Mark notification as clicked
const markAsClicked = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.markAsClicked(
    notificationId,
    userId
  );
  return res.success({ notification }, "Notification marked as clicked");
});

// Mark notification as dismissed
const markAsDismissed = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await notificationService.markAsDismissed(
    notificationId,
    userId
  );
  return res.success({ notification }, "Notification dismissed");
});

// Bulk mark as read
const bulkMarkAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;
  const userId = req.user._id;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new ApiError(400, "Notification IDs array is required");
  }

  const result = await notificationService.bulkMarkAsRead(
    notificationIds,
    userId
  );
  return res.success({ result }, "Notifications marked as read");
});

// Bulk delete notifications
const bulkDeleteNotifications = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;
  const userId = req.user._id;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new ApiError(400, "Notification IDs array is required");
  }

  const result = await notificationService.bulkDeleteNotifications(
    notificationIds,
    userId
  );
  return res.success({ result }, "Notifications deleted");
});

// Get notification statistics
const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const stats = await notificationService.getNotificationStats(userId);
  return res.success(
    { stats },
    "Notification statistics retrieved successfully"
  );
});

// Create notification (Admin only)
const createNotification = asyncHandler(async (req, res) => {
  const notificationData = {
    ...req.body,
    metadata: {
      ...req.body.metadata,
      source: "admin",
      createdBy: req.user._id,
    },
  };

  const notification = await notificationService.createNotification(
    notificationData
  );
  return res.created({ notification }, "Notification created successfully");
});

// Send notification (Admin only)
const sendNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const result = await notificationService.sendNotification(notificationId);
  return res.success({ result }, "Notification sent successfully");
});

// Get all notifications (Admin only)
const getAllNotifications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    recipient,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // This would need to be implemented in the service for admin access
  // For now, we'll use the user service pattern
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    status,
    recipient,
    search,
    sortBy,
    sortOrder,
  };

  // This is a placeholder - would need proper admin service implementation
  const notifications = await notificationService.getUserNotifications(
    null,
    options
  );
  return res.paginated(
    notifications,
    "All notifications retrieved successfully"
  );
});

// Update notification (Admin only)
const updateNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const updateData = req.body;

  // This would need to be implemented in the service
  // const notification = await notificationService.updateNotification(notificationId, updateData);

  return res.success(
    { message: "Update notification functionality to be implemented" },
    "Notification update not implemented yet"
  );
});

// Delete notification (Admin only)
const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  // This would need to be implemented in the service
  // await notificationService.deleteNotification(notificationId);

  return res.success(
    null,
    "Delete notification functionality to be implemented"
  );
});

// Process scheduled notifications (Admin only)
const processScheduledNotifications = asyncHandler(async (req, res) => {
  const results = await notificationService.processScheduledNotifications();
  return res.success({ results }, "Scheduled notifications processed");
});

// Retry failed notifications (Admin only)
const retryFailedNotifications = asyncHandler(async (req, res) => {
  const { maxAttempts = 3 } = req.body;
  const results = await notificationService.retryFailedNotifications(
    maxAttempts
  );
  return res.success({ results }, "Failed notifications retry initiated");
});

// Cleanup expired notifications (Admin only)
const cleanupExpiredNotifications = asyncHandler(async (req, res) => {
  const results = await notificationService.cleanupExpiredNotifications();
  return res.success({ results }, "Expired notifications cleaned up");
});

// Send bulk notifications (Admin only)
const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { notifications, options = {} } = req.body;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    throw new ApiError(400, "Notifications array is required");
  }

  const results = await notificationService.sendBulkNotifications(
    notifications,
    options
  );
  return res.success({ results }, "Bulk notifications sent");
});

module.exports = {
  // User notification operations
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAsClicked,
  markAsDismissed,
  bulkMarkAsRead,
  bulkDeleteNotifications,
  getNotificationStats,

  // Admin notification operations
  createNotification,
  sendNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  processScheduledNotifications,
  retryFailedNotifications,
  cleanupExpiredNotifications,
  sendBulkNotifications,
};
