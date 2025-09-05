const express = require("express");
const notificationController = require("../controllers/notification.controller");
const templateController = require("../controllers/template.controller");
const {
  validateNotificationCreate,
  validateNotificationUpdate,
  validateNotificationId,
  validateBulkOperation,
  validatePagination,
  validateSearch,
  validateTemplateCreate,
  validateTemplateUpdate,
  validateTemplateId,
  validateTemplateType,
} = require("../validators/notification.validators");
const {
  authenticate,
  adminOnly,
} = require("../../../shared/middleware/auth.middleware");

const router = express.Router();

// ==================== USER NOTIFICATION ROUTES ====================

// Apply authentication middleware to all user routes
router.use(authenticate);

// Get user notifications
router.get(
  "/",
  validatePagination,
  notificationController.getUserNotifications
);

// Get notification by ID
router.get(
  "/:notificationId",
  validateNotificationId,
  notificationController.getNotificationById
);

// Mark notification as read
router.patch(
  "/:notificationId/read",
  validateNotificationId,
  notificationController.markAsRead
);

// Mark notification as clicked
router.patch(
  "/:notificationId/click",
  validateNotificationId,
  notificationController.markAsClicked
);

// Mark notification as dismissed
router.patch(
  "/:notificationId/dismiss",
  validateNotificationId,
  notificationController.markAsDismissed
);

// Bulk mark as read
router.patch(
  "/bulk/read",
  validateBulkOperation,
  notificationController.bulkMarkAsRead
);

// Bulk delete notifications
router.delete(
  "/bulk",
  validateBulkOperation,
  notificationController.bulkDeleteNotifications
);

// Get notification statistics
router.get("/stats/overview", notificationController.getNotificationStats);

// ==================== ADMIN NOTIFICATION ROUTES ====================

// Apply admin middleware to admin routes
router.use(adminOnly);

// Create notification
router.post(
  "/",
  validateNotificationCreate,
  notificationController.createNotification
);

// Send notification
router.post(
  "/:notificationId/send",
  validateNotificationId,
  notificationController.sendNotification
);

// Get all notifications (admin)
router.get(
  "/admin/all",
  validatePagination,
  notificationController.getAllNotifications
);

// Update notification
router.put(
  "/:notificationId",
  validateNotificationId,
  validateNotificationUpdate,
  notificationController.updateNotification
);

// Delete notification
router.delete(
  "/:notificationId",
  validateNotificationId,
  notificationController.deleteNotification
);

// Process scheduled notifications
router.post(
  "/admin/process-scheduled",
  notificationController.processScheduledNotifications
);

// Retry failed notifications
router.post(
  "/admin/retry-failed",
  notificationController.retryFailedNotifications
);

// Cleanup expired notifications
router.post(
  "/admin/cleanup-expired",
  notificationController.cleanupExpiredNotifications
);

// Send bulk notifications
router.post(
  "/admin/bulk-send",
  validateBulkOperation,
  notificationController.sendBulkNotifications
);

// ==================== TEMPLATE ROUTES ====================

// Get notification templates
router.get(
  "/templates",
  validatePagination,
  templateController.getNotificationTemplates
);

// Get template by ID
router.get(
  "/templates/:templateId",
  validateTemplateId,
  templateController.getTemplateById
);

// Get template by type
router.get(
  "/templates/type/:type",
  validateTemplateType,
  templateController.getTemplateByType
);

// Create notification template
router.post(
  "/templates",
  validateTemplateCreate,
  templateController.createNotificationTemplate
);

// Update notification template
router.put(
  "/templates/:templateId",
  validateTemplateId,
  validateTemplateUpdate,
  templateController.updateNotificationTemplate
);

// Delete notification template
router.delete(
  "/templates/:templateId",
  validateTemplateId,
  templateController.deleteNotificationTemplate
);

// Duplicate notification template
router.post(
  "/templates/:templateId/duplicate",
  validateTemplateId,
  templateController.duplicateNotificationTemplate
);

// Test notification template
router.post(
  "/templates/:templateId/test",
  validateTemplateId,
  templateController.testNotificationTemplate
);

// Get template statistics
router.get("/templates/stats/overview", templateController.getTemplateStats);

// Bulk update template status
router.patch(
  "/templates/bulk/status",
  templateController.bulkUpdateTemplateStatus
);

// Export template
router.get(
  "/templates/:templateId/export",
  validateTemplateId,
  templateController.exportTemplate
);

// Import template
router.post("/templates/import", templateController.importTemplate);

// Validate template
router.post("/templates/validate", templateController.validateTemplate);

module.exports = router;
