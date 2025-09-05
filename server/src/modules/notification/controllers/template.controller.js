const notificationService = require("../services/notification.service");
const ApiError = require("../../../shared/utils/apiError");
const asyncHandler = require("../../../shared/utils/asyncHandler");

// Get notification templates
const getNotificationTemplates = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    category,
    activeOnly = true,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    category,
    activeOnly: activeOnly === "true",
    search,
    sortBy,
    sortOrder,
  };

  const templates = await notificationService.getNotificationTemplates(options);
  return res.paginated(
    templates,
    "Notification templates retrieved successfully"
  );
});

// Get template by ID
const getTemplateById = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  // This would need to be implemented in the service
  // const template = await notificationService.getTemplateById(templateId);

  return res.success(
    { message: "Get template by ID functionality to be implemented" },
    "Template retrieval not implemented yet"
  );
});

// Get template by type
const getTemplateByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { isDefault = true } = req.query;

  const template = await notificationService.getTemplateByType(
    type,
    isDefault === "true"
  );

  if (!template) {
    throw new ApiError(404, `No template found for type: ${type}`);
  }

  return res.success({ template }, "Template retrieved successfully");
});

// Create notification template
const createNotificationTemplate = asyncHandler(async (req, res) => {
  const templateData = {
    ...req.body,
    metadata: {
      ...req.body.metadata,
      createdBy: req.user._id,
    },
  };

  const template = await notificationService.createNotificationTemplate(
    templateData
  );
  return res.created(
    { template },
    "Notification template created successfully"
  );
});

// Update notification template
const updateNotificationTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const updateData = {
    ...req.body,
    metadata: {
      ...req.body.metadata,
      updatedBy: req.user._id,
    },
  };

  const template = await notificationService.updateNotificationTemplate(
    templateId,
    updateData
  );
  return res.success(
    { template },
    "Notification template updated successfully"
  );
});

// Delete notification template
const deleteNotificationTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  // This would need to be implemented in the service
  // await notificationService.deleteNotificationTemplate(templateId);

  return res.success(null, "Delete template functionality to be implemented");
});

// Duplicate notification template
const duplicateNotificationTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const { name, description } = req.body;

  // This would need to be implemented in the service
  // const template = await notificationService.duplicateTemplate(templateId, { name, description });

  return res.success(
    { message: "Duplicate template functionality to be implemented" },
    "Template duplication not implemented yet"
  );
});

// Test notification template
const testNotificationTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const { testData, recipient } = req.body;

  if (!testData || !recipient) {
    throw new ApiError(400, "Test data and recipient are required");
  }

  // This would need to be implemented in the service
  // const result = await notificationService.testTemplate(templateId, testData, recipient);

  return res.success(
    { message: "Test template functionality to be implemented" },
    "Template testing not implemented yet"
  );
});

// Get template statistics
const getTemplateStats = asyncHandler(async (req, res) => {
  // This would need to be implemented in the service
  // const stats = await notificationService.getTemplateStats();

  return res.success(
    { message: "Template statistics functionality to be implemented" },
    "Template statistics not implemented yet"
  );
});

// Bulk update template status
const bulkUpdateTemplateStatus = asyncHandler(async (req, res) => {
  const { templateIds, isActive } = req.body;

  if (!Array.isArray(templateIds) || templateIds.length === 0) {
    throw new ApiError(400, "Template IDs array is required");
  }

  if (typeof isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean value");
  }

  // This would need to be implemented in the service
  // const result = await notificationService.bulkUpdateTemplateStatus(templateIds, isActive);

  return res.success(
    { message: "Bulk update template status functionality to be implemented" },
    "Bulk update not implemented yet"
  );
});

// Export template
const exportTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const { format = "json" } = req.query;

  // This would need to be implemented in the service
  // const templateData = await notificationService.exportTemplate(templateId, format);

  return res.success(
    { message: "Export template functionality to be implemented" },
    "Template export not implemented yet"
  );
});

// Import template
const importTemplate = asyncHandler(async (req, res) => {
  const templateData = req.body;

  if (!templateData.name || !templateData.type) {
    throw new ApiError(400, "Template name and type are required");
  }

  // This would need to be implemented in the service
  // const template = await notificationService.importTemplate(templateData);

  return res.success(
    { message: "Import template functionality to be implemented" },
    "Template import not implemented yet"
  );
});

// Validate template
const validateTemplate = asyncHandler(async (req, res) => {
  const templateData = req.body;

  // Basic validation
  const errors = [];

  if (!templateData.name) {
    errors.push("Template name is required");
  }

  if (!templateData.type) {
    errors.push("Template type is required");
  }

  if (!templateData.subject) {
    errors.push("Template subject is required");
  }

  if (!templateData.title) {
    errors.push("Template title is required");
  }

  if (!templateData.message) {
    errors.push("Template message is required");
  }

  // Validate variables
  if (templateData.variables && Array.isArray(templateData.variables)) {
    templateData.variables.forEach((variable, index) => {
      if (!variable.name) {
        errors.push(`Variable ${index + 1}: name is required`);
      }
      if (!variable.type) {
        errors.push(`Variable ${index + 1}: type is required`);
      }
    });
  }

  // Validate channels
  if (templateData.channels) {
    const channels = templateData.channels;
    if (
      channels.email &&
      channels.email.enabled &&
      !templateData.emailContent
    ) {
      errors.push("Email content is required when email channel is enabled");
    }
    if (channels.sms && channels.sms.enabled && !templateData.smsContent) {
      errors.push("SMS content is required when SMS channel is enabled");
    }
    if (channels.push && channels.push.enabled && !templateData.pushContent) {
      errors.push("Push content is required when push channel is enabled");
    }
  }

  const isValid = errors.length === 0;

  return res.success(
    {
      isValid,
      errors,
      warnings: [], // Could add warnings for best practices
    },
    "Template validation completed"
  );
});

module.exports = {
  // Template CRUD operations
  getNotificationTemplates,
  getTemplateById,
  getTemplateByType,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  duplicateNotificationTemplate,

  // Template operations
  testNotificationTemplate,
  getTemplateStats,
  bulkUpdateTemplateStatus,
  exportTemplate,
  importTemplate,
  validateTemplate,
};
