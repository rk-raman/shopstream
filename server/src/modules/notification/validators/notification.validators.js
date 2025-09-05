const {
  validateJoiBody,
  validateJoiQuery,
  validateJoiParams,
  validateJoiMultiple,
  validateCustom,
  sanitizeMiddleware,
} = require("../../../shared/middleware/validation.middleware");

const {
  notificationCreateSchema,
  notificationUpdateSchema,
  notificationIdSchema,
  bulkOperationSchema,
  templateCreateSchema,
  templateUpdateSchema,
  templateIdSchema,
  templateTypeSchema,
  paginationSchema,
  searchSchema,
  templateTestSchema,
  templateDuplicateSchema,
  templateImportSchema,
  bulkTemplateUpdateSchema,
  retryFailedSchema,
  bulkNotificationSchema,
  commonPatterns,
} = require("./notification.schemas");

// ==================== NOTIFICATION VALIDATORS ====================

/**
 * Notification Creation Validation
 * Validates all required fields for creating a notification
 */
const validateNotificationCreate = [
  sanitizeMiddleware,
  validateJoiBody(notificationCreateSchema),
];

/**
 * Notification Update Validation
 * Validates optional fields for updating a notification
 */
const validateNotificationUpdate = [
  sanitizeMiddleware,
  validateJoiBody(notificationUpdateSchema),
];

/**
 * Notification ID Validation
 * Validates MongoDB ObjectId for notification operations
 */
const validateNotificationId = [validateJoiParams(notificationIdSchema)];

/**
 * Bulk Operation Validation
 * Validates array of notification IDs for bulk operations
 */
const validateBulkOperation = [
  sanitizeMiddleware,
  validateJoiBody(bulkOperationSchema),
];

/**
 * Bulk Notification Creation Validation
 * Validates array of notifications for bulk creation
 */
const validateBulkNotificationCreate = [
  sanitizeMiddleware,
  validateJoiBody(bulkNotificationSchema),
];

// ==================== TEMPLATE VALIDATORS ====================

/**
 * Template Creation Validation
 * Validates all required fields for creating a notification template
 */
const validateTemplateCreate = [
  sanitizeMiddleware,
  validateJoiBody(templateCreateSchema),
];

/**
 * Template Update Validation
 * Validates optional fields for updating a notification template
 */
const validateTemplateUpdate = [
  sanitizeMiddleware,
  validateJoiBody(templateUpdateSchema),
];

/**
 * Template ID Validation
 * Validates MongoDB ObjectId for template operations
 */
const validateTemplateId = [validateJoiParams(templateIdSchema)];

/**
 * Template Type Validation
 * Validates template type parameter
 */
const validateTemplateType = [validateJoiParams(templateTypeSchema)];

/**
 * Template Test Validation
 * Validates test data and recipient for template testing
 */
const validateTemplateTest = [
  sanitizeMiddleware,
  validateJoiBody(templateTestSchema),
];

/**
 * Template Duplicate Validation
 * Validates name and description for template duplication
 */
const validateTemplateDuplicate = [
  sanitizeMiddleware,
  validateJoiBody(templateDuplicateSchema),
];

/**
 * Template Import Validation
 * Validates template data for import
 */
const validateTemplateImport = [
  sanitizeMiddleware,
  validateJoiBody(templateImportSchema),
];

/**
 * Bulk Template Update Validation
 * Validates template IDs and status for bulk update
 */
const validateBulkTemplateUpdate = [
  sanitizeMiddleware,
  validateJoiBody(bulkTemplateUpdateSchema),
];

// ==================== QUERY VALIDATORS ====================

/**
 * Pagination Validation
 * Validates pagination parameters (page, limit, sort)
 */
const validatePagination = [validateJoiQuery(paginationSchema)];

/**
 * Search Validation
 * Validates search query parameters with pagination
 */
const validateSearch = [validateJoiQuery(searchSchema)];

/**
 * Retry Failed Validation
 * Validates max attempts for retry operations
 */
const validateRetryFailed = [
  sanitizeMiddleware,
  validateJoiBody(retryFailedSchema),
];

// ==================== CUSTOM VALIDATORS ====================

/**
 * Notification Channel Validation
 * Custom validator to ensure at least one channel is enabled
 */
const validateNotificationChannels = validateCustom((req) => {
  const { channels } = req.body;
  if (!channels) return true; // Channels are optional

  const enabledChannels = Object.values(channels).filter(
    (channel) => channel.enabled
  );
  return enabledChannels.length > 0;
}, "At least one notification channel must be enabled");

/**
 * Template Variable Validation
 * Custom validator to ensure variable names are unique
 */
const validateTemplateVariables = validateCustom((req) => {
  const { variables } = req.body;
  if (!variables || !Array.isArray(variables)) return true;

  const variableNames = variables.map((v) => v.name);
  const uniqueNames = new Set(variableNames);

  return variableNames.length === uniqueNames.size;
}, "Template variable names must be unique");

/**
 * Template Content Validation
 * Custom validator to ensure content exists for enabled channels
 */
const validateTemplateContent = validateCustom((req) => {
  const { channels, emailContent, smsContent, pushContent } = req.body;
  if (!channels) return true;

  if (channels.email && channels.email.enabled && !emailContent) {
    return false;
  }
  if (channels.sms && channels.sms.enabled && !smsContent) {
    return false;
  }
  if (channels.push && channels.push.enabled && !pushContent) {
    return false;
  }

  return true;
}, "Content must be provided for all enabled channels");

/**
 * Scheduled Time Validation
 * Custom validator to ensure scheduled time is in the future
 */
const validateScheduledTime = validateCustom((req) => {
  const { scheduledAt } = req.body;
  if (!scheduledAt) return true;

  const scheduledDate = new Date(scheduledAt);
  const now = new Date();

  return scheduledDate > now;
}, "Scheduled time must be in the future");

/**
 * Expiry Time Validation
 * Custom validator to ensure expiry time is after creation/scheduled time
 */
const validateExpiryTime = validateCustom((req) => {
  const { expiresAt, scheduledAt } = req.body;
  if (!expiresAt) return true;

  const expiryDate = new Date(expiresAt);
  const referenceDate = scheduledAt ? new Date(scheduledAt) : new Date();

  return expiryDate > referenceDate;
}, "Expiry time must be after scheduled/creation time");

/**
 * Template Name Uniqueness Validation
 * Custom async validator to check template name uniqueness
 */
const validateTemplateNameUnique = validateCustom(async (req) => {
  // This would typically check against database
  // For now, we'll assume it's unique
  return true;
}, "Template name must be unique");

/**
 * Notification Recipient Validation
 * Custom validator to ensure recipient exists and is valid
 */
const validateNotificationRecipient = validateCustom(async (req) => {
  const { recipient, recipientType } = req.body;
  if (!recipient) return false;

  // This would typically check against database
  // For now, we'll assume it's valid
  return true;
}, "Invalid notification recipient");

/**
 * Template Variable Type Validation
 * Custom validator to ensure variable types are valid
 */
const validateTemplateVariableTypes = validateCustom((req) => {
  const { variables } = req.body;
  if (!variables || !Array.isArray(variables)) return true;

  const validTypes = ["string", "number", "date", "boolean", "object"];

  return variables.every((variable) => validTypes.includes(variable.type));
}, "Invalid variable type. Must be one of: string, number, date, boolean, object");

/**
 * Notification Priority Validation
 * Custom validator for priority-based content validation
 */
const validateNotificationPriority = validateCustom((req) => {
  const { priority, channels } = req.body;

  // High priority notifications should have at least one immediate channel
  if (priority === "high" || priority === "urgent") {
    if (!channels) return false;

    const immediateChannels = ["push", "sms"];
    const hasImmediateChannel = immediateChannels.some(
      (channel) => channels[channel] && channels[channel].enabled
    );

    return hasImmediateChannel;
  }

  return true;
}, "High priority notifications must have at least one immediate channel (push or SMS) enabled");

// ==================== COMPOSITE VALIDATORS ====================

/**
 * Complete Notification Creation with Channel Validation
 * Combines notification creation with channel validation
 */
const validateCompleteNotificationCreate = [
  sanitizeMiddleware,
  validateJoiBody(notificationCreateSchema),
  validateNotificationChannels,
  validateScheduledTime,
  validateExpiryTime,
  validateNotificationRecipient,
  validateNotificationPriority,
];

/**
 * Complete Template Creation with Content Validation
 * Combines template creation with content validation
 */
const validateCompleteTemplateCreate = [
  sanitizeMiddleware,
  validateJoiBody(templateCreateSchema),
  validateTemplateVariables,
  validateTemplateContent,
  validateTemplateNameUnique,
  validateTemplateVariableTypes,
];

/**
 * Template Update with Validation
 * Combines template update with content validation
 */
const validateCompleteTemplateUpdate = [
  sanitizeMiddleware,
  validateJoiBody(templateUpdateSchema),
  validateTemplateVariables,
  validateTemplateContent,
  validateTemplateVariableTypes,
];

/**
 * Bulk Notification with Validation
 * Combines bulk notification creation with individual validation
 */
const validateCompleteBulkNotificationCreate = [
  sanitizeMiddleware,
  validateJoiBody(bulkNotificationSchema),
  validateCustom((req) => {
    const { notifications } = req.body;
    if (!Array.isArray(notifications)) return false;

    // Validate each notification in the bulk
    return notifications.every((notification) => {
      // Basic validation for each notification
      return (
        notification.title && notification.message && notification.recipient
      );
    });
  }, "Each notification in bulk must have title, message, and recipient"),
];

// ==================== EXPORT ALL VALIDATORS ====================

module.exports = {
  // Notification validators
  validateNotificationCreate,
  validateNotificationUpdate,
  validateNotificationId,
  validateBulkOperation,
  validateBulkNotificationCreate,

  // Template validators
  validateTemplateCreate,
  validateTemplateUpdate,
  validateTemplateId,
  validateTemplateType,
  validateTemplateTest,
  validateTemplateDuplicate,
  validateTemplateImport,
  validateBulkTemplateUpdate,

  // Query validators
  validatePagination,
  validateSearch,
  validateRetryFailed,

  // Custom validators
  validateNotificationChannels,
  validateTemplateVariables,
  validateTemplateContent,
  validateScheduledTime,
  validateExpiryTime,
  validateTemplateNameUnique,
  validateNotificationRecipient,
  validateTemplateVariableTypes,
  validateNotificationPriority,

  // Composite validators
  validateCompleteNotificationCreate,
  validateCompleteTemplateCreate,
  validateCompleteTemplateUpdate,
  validateCompleteBulkNotificationCreate,

  // Utility
  sanitizeMiddleware,
};
