const Joi = require("joi");

// Common patterns
const commonPatterns = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/),
  url: Joi.string().uri(),
  date: Joi.date().iso(),
  boolean: Joi.boolean(),
  string: Joi.string().trim(),
  number: Joi.number(),
  array: Joi.array(),
};

// Notification schemas
const notificationCreateSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  message: Joi.string().trim().max(1000).required(),
  description: Joi.string().trim().max(2000).optional(),
  recipient: commonPatterns.objectId.required(),
  recipientType: Joi.string()
    .valid("user", "admin", "seller", "all")
    .default("user"),
  type: Joi.string()
    .valid(
      "order",
      "payment",
      "product",
      "promotion",
      "system",
      "security",
      "review",
      "inventory",
      "shipping",
      "account",
      "general"
    )
    .required(),
  category: Joi.string()
    .valid(
      "info",
      "success",
      "warning",
      "error",
      "promotion",
      "reminder",
      "alert"
    )
    .default("info"),
  channels: Joi.object({
    email: Joi.object({
      enabled: Joi.boolean().default(false),
    }).optional(),
    sms: Joi.object({
      enabled: Joi.boolean().default(false),
    }).optional(),
    push: Joi.object({
      enabled: Joi.boolean().default(false),
    }).optional(),
    inApp: Joi.object({
      enabled: Joi.boolean().default(true),
    }).optional(),
  }).optional(),
  priority: Joi.string()
    .valid("low", "normal", "high", "urgent")
    .default("normal"),
  scheduledAt: commonPatterns.date.optional(),
  expiresAt: commonPatterns.date.optional(),
  actionUrl: commonPatterns.url.optional(),
  actionText: Joi.string().trim().max(50).optional(),
  actionData: Joi.object().optional(),
  relatedEntity: Joi.object({
    type: Joi.string().valid("order", "product", "payment", "user", "review"),
    id: commonPatterns.objectId,
  }).optional(),
  templateId: commonPatterns.objectId.optional(),
  templateData: Joi.object().optional(),
  autoSend: Joi.boolean().default(true),
  metadata: Joi.object({
    source: Joi.string()
      .valid("system", "admin", "user", "automated")
      .default("system"),
    triggerEvent: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    customData: Joi.object().optional(),
  }).optional(),
});

const notificationUpdateSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  message: Joi.string().trim().max(1000).optional(),
  description: Joi.string().trim().max(2000).optional(),
  type: Joi.string()
    .valid(
      "order",
      "payment",
      "product",
      "promotion",
      "system",
      "security",
      "review",
      "inventory",
      "shipping",
      "account",
      "general"
    )
    .optional(),
  category: Joi.string()
    .valid(
      "info",
      "success",
      "warning",
      "error",
      "promotion",
      "reminder",
      "alert"
    )
    .optional(),
  priority: Joi.string().valid("low", "normal", "high", "urgent").optional(),
  scheduledAt: commonPatterns.date.optional(),
  expiresAt: commonPatterns.date.optional(),
  actionUrl: commonPatterns.url.optional(),
  actionText: Joi.string().trim().max(50).optional(),
  actionData: Joi.object().optional(),
  status: Joi.string()
    .valid("pending", "scheduled", "sent", "delivered", "failed", "cancelled")
    .optional(),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string()).optional(),
    customData: Joi.object().optional(),
  }).optional(),
});

const notificationIdSchema = Joi.object({
  notificationId: commonPatterns.objectId.required(),
});

const bulkOperationSchema = Joi.object({
  notificationIds: Joi.array().items(commonPatterns.objectId).min(1).required(),
});

// Template schemas
const templateCreateSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string()
    .valid(
      "order",
      "payment",
      "product",
      "promotion",
      "system",
      "security",
      "review",
      "inventory",
      "shipping",
      "account",
      "general"
    )
    .required(),
  category: Joi.string()
    .valid(
      "info",
      "success",
      "warning",
      "error",
      "promotion",
      "reminder",
      "alert"
    )
    .default("info"),
  subject: Joi.string().trim().max(200).required(),
  title: Joi.string().trim().max(200).required(),
  message: Joi.string().trim().max(1000).required(),
  description: Joi.string().trim().max(2000).optional(),
  emailContent: Joi.object({
    html: Joi.string().optional(),
    text: Joi.string().optional(),
    attachments: Joi.array()
      .items(
        Joi.object({
          filename: Joi.string().required(),
          content: Joi.string().required(),
          contentType: Joi.string().required(),
        })
      )
      .optional(),
  }).optional(),
  smsContent: Joi.object({
    message: Joi.string().trim().max(160).optional(),
  }).optional(),
  pushContent: Joi.object({
    title: Joi.string().trim().max(100).optional(),
    body: Joi.string().trim().max(200).optional(),
    icon: Joi.string().optional(),
    image: Joi.string().optional(),
    actionUrl: Joi.string().optional(),
    actionText: Joi.string().optional(),
  }).optional(),
  variables: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string()
          .valid("string", "number", "date", "boolean", "object")
          .default("string"),
        required: Joi.boolean().default(false),
        defaultValue: Joi.string().optional(),
        description: Joi.string().optional(),
      })
    )
    .optional(),
  channels: Joi.object({
    email: Joi.object({
      enabled: Joi.boolean().default(true),
      required: Joi.boolean().default(false),
    }).optional(),
    sms: Joi.object({
      enabled: Joi.boolean().default(false),
      required: Joi.boolean().default(false),
    }).optional(),
    push: Joi.object({
      enabled: Joi.boolean().default(true),
      required: Joi.boolean().default(false),
    }).optional(),
    inApp: Joi.object({
      enabled: Joi.boolean().default(true),
      required: Joi.boolean().default(true),
    }).optional(),
  }).optional(),
  priority: Joi.string()
    .valid("low", "normal", "high", "urgent")
    .default("normal"),
  defaultExpiry: Joi.number().min(1).default(30),
  autoSend: Joi.boolean().default(false),
  batchProcessing: Joi.object({
    enabled: Joi.boolean().default(false),
    batchSize: Joi.number().min(1).default(100),
    delayBetweenBatches: Joi.number().min(0).default(1000),
  }).optional(),
  isActive: Joi.boolean().default(true),
  isDefault: Joi.boolean().default(false),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string()).optional(),
    language: Joi.string().valid("en", "hi", "ta", "te", "bn").default("en"),
    customData: Joi.object().optional(),
  }).optional(),
});

const templateUpdateSchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string()
    .valid(
      "order",
      "payment",
      "product",
      "promotion",
      "system",
      "security",
      "review",
      "inventory",
      "shipping",
      "account",
      "general"
    )
    .optional(),
  category: Joi.string()
    .valid(
      "info",
      "success",
      "warning",
      "error",
      "promotion",
      "reminder",
      "alert"
    )
    .optional(),
  subject: Joi.string().trim().max(200).optional(),
  title: Joi.string().trim().max(200).optional(),
  message: Joi.string().trim().max(1000).optional(),
  description: Joi.string().trim().max(2000).optional(),
  emailContent: Joi.object({
    html: Joi.string().optional(),
    text: Joi.string().optional(),
    attachments: Joi.array()
      .items(
        Joi.object({
          filename: Joi.string().required(),
          content: Joi.string().required(),
          contentType: Joi.string().required(),
        })
      )
      .optional(),
  }).optional(),
  smsContent: Joi.object({
    message: Joi.string().trim().max(160).optional(),
  }).optional(),
  pushContent: Joi.object({
    title: Joi.string().trim().max(100).optional(),
    body: Joi.string().trim().max(200).optional(),
    icon: Joi.string().optional(),
    image: Joi.string().optional(),
    actionUrl: Joi.string().optional(),
    actionText: Joi.string().optional(),
  }).optional(),
  variables: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string()
          .valid("string", "number", "date", "boolean", "object")
          .default("string"),
        required: Joi.boolean().default(false),
        defaultValue: Joi.string().optional(),
        description: Joi.string().optional(),
      })
    )
    .optional(),
  channels: Joi.object({
    email: Joi.object({
      enabled: Joi.boolean().optional(),
      required: Joi.boolean().optional(),
    }).optional(),
    sms: Joi.object({
      enabled: Joi.boolean().optional(),
      required: Joi.boolean().optional(),
    }).optional(),
    push: Joi.object({
      enabled: Joi.boolean().optional(),
      required: Joi.boolean().optional(),
    }).optional(),
    inApp: Joi.object({
      enabled: Joi.boolean().optional(),
      required: Joi.boolean().optional(),
    }).optional(),
  }).optional(),
  priority: Joi.string().valid("low", "normal", "high", "urgent").optional(),
  defaultExpiry: Joi.number().min(1).optional(),
  autoSend: Joi.boolean().optional(),
  batchProcessing: Joi.object({
    enabled: Joi.boolean().optional(),
    batchSize: Joi.number().min(1).optional(),
    delayBetweenBatches: Joi.number().min(0).optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
  isDefault: Joi.boolean().optional(),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string()).optional(),
    language: Joi.string().valid("en", "hi", "ta", "te", "bn").optional(),
    customData: Joi.object().optional(),
  }).optional(),
});

const templateIdSchema = Joi.object({
  templateId: commonPatterns.objectId.required(),
});

const templateTypeSchema = Joi.object({
  type: Joi.string()
    .valid(
      "order",
      "payment",
      "product",
      "promotion",
      "system",
      "security",
      "review",
      "inventory",
      "shipping",
      "account",
      "general"
    )
    .required(),
});

// Query schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

const searchSchema = Joi.object({
  search: Joi.string().trim().min(1).optional(),
  type: Joi.string().optional(),
  category: Joi.string().optional(),
  status: Joi.string().optional(),
  activeOnly: Joi.boolean().optional(),
  unreadOnly: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

// Test schemas
const templateTestSchema = Joi.object({
  testData: Joi.object().required(),
  recipient: commonPatterns.objectId.required(),
});

const templateDuplicateSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
});

const templateImportSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string()
    .valid(
      "order",
      "payment",
      "product",
      "promotion",
      "system",
      "security",
      "review",
      "inventory",
      "shipping",
      "account",
      "general"
    )
    .required(),
  category: Joi.string()
    .valid(
      "info",
      "success",
      "warning",
      "error",
      "promotion",
      "reminder",
      "alert"
    )
    .default("info"),
  subject: Joi.string().trim().max(200).required(),
  title: Joi.string().trim().max(200).required(),
  message: Joi.string().trim().max(1000).required(),
  description: Joi.string().trim().max(2000).optional(),
  emailContent: Joi.object().optional(),
  smsContent: Joi.object().optional(),
  pushContent: Joi.object().optional(),
  variables: Joi.array().optional(),
  channels: Joi.object().optional(),
  priority: Joi.string()
    .valid("low", "normal", "high", "urgent")
    .default("normal"),
  defaultExpiry: Joi.number().min(1).default(30),
  autoSend: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  isDefault: Joi.boolean().default(false),
  metadata: Joi.object().optional(),
});

const bulkTemplateUpdateSchema = Joi.object({
  templateIds: Joi.array().items(commonPatterns.objectId).min(1).required(),
  isActive: Joi.boolean().required(),
});

const retryFailedSchema = Joi.object({
  maxAttempts: Joi.number().integer().min(1).max(10).default(3),
});

const bulkNotificationSchema = Joi.object({
  notifications: Joi.array().items(notificationCreateSchema).min(1).required(),
  options: Joi.object({
    batchSize: Joi.number().integer().min(1).max(1000).default(100),
    delayBetweenBatches: Joi.number().integer().min(0).default(1000),
  }).optional(),
});

module.exports = {
  // Notification schemas
  notificationCreateSchema,
  notificationUpdateSchema,
  notificationIdSchema,
  bulkOperationSchema,

  // Template schemas
  templateCreateSchema,
  templateUpdateSchema,
  templateIdSchema,
  templateTypeSchema,

  // Query schemas
  paginationSchema,
  searchSchema,

  // Test and operation schemas
  templateTestSchema,
  templateDuplicateSchema,
  templateImportSchema,
  bulkTemplateUpdateSchema,
  retryFailedSchema,
  bulkNotificationSchema,

  // Common patterns
  commonPatterns,
};
