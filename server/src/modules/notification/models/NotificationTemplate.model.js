const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const notificationTemplateSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Template name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Template Type and Category
    type: {
      type: String,
      enum: {
        values: [
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
          "general",
        ],
        message: "Invalid template type",
      },
      required: [true, "Template type is required"],
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "info",
          "success",
          "warning",
          "error",
          "promotion",
          "reminder",
          "alert",
        ],
        message: "Invalid template category",
      },
      default: "info",
      index: true,
    },

    // Template Content
    subject: {
      type: String,
      required: [true, "Template subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    title: {
      type: String,
      required: [true, "Template title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Template message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // Channel-specific Content
    emailContent: {
      html: {
        type: String,
        trim: true,
      },
      text: {
        type: String,
        trim: true,
      },
      attachments: [
        {
          filename: String,
          content: String,
          contentType: String,
        },
      ],
    },
    smsContent: {
      message: {
        type: String,
        trim: true,
        maxlength: [160, "SMS message cannot exceed 160 characters"],
      },
    },
    pushContent: {
      title: {
        type: String,
        trim: true,
        maxlength: [100, "Push title cannot exceed 100 characters"],
      },
      body: {
        type: String,
        trim: true,
        maxlength: [200, "Push body cannot exceed 200 characters"],
      },
      icon: String,
      image: String,
      actionUrl: String,
      actionText: String,
    },

    // Template Variables
    variables: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          enum: ["string", "number", "date", "boolean", "object"],
          default: "string",
        },
        required: {
          type: Boolean,
          default: false,
        },
        defaultValue: String,
        description: String,
      },
    ],

    // Channel Configuration
    channels: {
      email: {
        enabled: {
          type: Boolean,
          default: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
      },
      sms: {
        enabled: {
          type: Boolean,
          default: false,
        },
        required: {
          type: Boolean,
          default: false,
        },
      },
      push: {
        enabled: {
          type: Boolean,
          default: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
      },
      inApp: {
        enabled: {
          type: Boolean,
          default: true,
        },
        required: {
          type: Boolean,
          default: true,
        },
      },
    },

    // Template Settings
    priority: {
      type: String,
      enum: {
        values: ["low", "normal", "high", "urgent"],
        message: "Priority must be low, normal, high, or urgent",
      },
      default: "normal",
    },
    defaultExpiry: {
      type: Number,
      default: 30, // days
      min: [1, "Default expiry must be at least 1 day"],
    },
    autoSend: {
      type: Boolean,
      default: false,
    },
    batchProcessing: {
      enabled: {
        type: Boolean,
        default: false,
      },
      batchSize: {
        type: Number,
        default: 100,
        min: [1, "Batch size must be at least 1"],
      },
      delayBetweenBatches: {
        type: Number,
        default: 1000, // milliseconds
      },
    },

    // Template Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },

    // Usage and Analytics
    usage: {
      totalSent: {
        type: Number,
        default: 0,
      },
      lastUsed: Date,
      successRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    // Metadata
    metadata: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      tags: [String],
      language: {
        type: String,
        default: "en",
        enum: ["en", "hi", "ta", "te", "bn"],
      },
      customData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Compound Indexes
notificationTemplateSchema.index({ type: 1, category: 1 });
notificationTemplateSchema.index({ isActive: 1, isDefault: 1 });
notificationTemplateSchema.index({ name: 1, version: 1 });

// Text index for search
notificationTemplateSchema.index({
  name: "text",
  description: "text",
  subject: "text",
  title: "text",
});

// Add pagination plugin
notificationTemplateSchema.plugin(mongoosePaginate);

// Virtual for template age in days
notificationTemplateSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for variable count
notificationTemplateSchema.virtual("variableCount").get(function () {
  return this.variables.length;
});

// Virtual for enabled channels count
notificationTemplateSchema.virtual("enabledChannelsCount").get(function () {
  const channels = this.channels;
  let count = 0;
  if (channels.email.enabled) count++;
  if (channels.sms.enabled) count++;
  if (channels.push.enabled) count++;
  if (channels.inApp.enabled) count++;
  return count;
});

// Pre-save middleware
notificationTemplateSchema.pre("save", async function (next) {
  try {
    // Increment version on update
    if (this.isModified() && !this.isNew) {
      this.version += 1;
    }

    // Ensure only one default template per type
    if (this.isDefault) {
      await this.constructor.updateMany(
        { type: this.type, _id: { $ne: this._id } },
        { isDefault: false }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
notificationTemplateSchema.methods.renderContent = function (data = {}) {
  const renderText = (text) => {
    if (!text) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return data[variable] || `{{${variable}}}`;
    });
  };

  return {
    subject: renderText(this.subject),
    title: renderText(this.title),
    message: renderText(this.message),
    description: renderText(this.description),
    emailContent: {
      html: renderText(this.emailContent?.html),
      text: renderText(this.emailContent?.text),
    },
    smsContent: {
      message: renderText(this.smsContent?.message),
    },
    pushContent: {
      title: renderText(this.pushContent?.title),
      body: renderText(this.pushContent?.body),
      actionUrl: renderText(this.pushContent?.actionUrl),
      actionText: renderText(this.pushContent?.actionText),
    },
  };
};

notificationTemplateSchema.methods.validateVariables = function (data) {
  const errors = [];

  this.variables.forEach((variable) => {
    if (variable.required && !(variable.name in data)) {
      errors.push(`Required variable '${variable.name}' is missing`);
    }

    if (variable.name in data) {
      const value = data[variable.name];
      const expectedType = variable.type;

      if (expectedType === "string" && typeof value !== "string") {
        errors.push(`Variable '${variable.name}' must be a string`);
      } else if (expectedType === "number" && typeof value !== "number") {
        errors.push(`Variable '${variable.name}' must be a number`);
      } else if (expectedType === "boolean" && typeof value !== "boolean") {
        errors.push(`Variable '${variable.name}' must be a boolean`);
      } else if (expectedType === "date" && !(value instanceof Date)) {
        errors.push(`Variable '${variable.name}' must be a date`);
      }
    }
  });

  return errors;
};

notificationTemplateSchema.methods.incrementUsage = function () {
  this.usage.totalSent += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

notificationTemplateSchema.methods.updateSuccessRate = function (
  successful,
  total
) {
  this.usage.successRate = total > 0 ? (successful / total) * 100 : 0;
  return this.save();
};

// Static methods
notificationTemplateSchema.statics.findByType = function (type, options = {}) {
  const { activeOnly = true, defaultOnly = false } = options;

  const filter = { type };

  if (activeOnly) filter.isActive = true;
  if (defaultOnly) filter.isDefault = true;

  return this.find(filter).sort({ isDefault: -1, createdAt: -1 });
};

notificationTemplateSchema.statics.findDefault = function (type) {
  return this.findOne({ type, isDefault: true, isActive: true });
};

notificationTemplateSchema.statics.searchTemplates = function (
  searchTerm,
  options = {}
) {
  const { page = 1, limit = 10, type, category, activeOnly = true } = options;

  const filter = {
    $text: { $search: searchTerm },
  };

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (activeOnly) filter.isActive = true;

  return this.paginate(filter, {
    page,
    limit,
    sort: { score: { $meta: "textScore" } },
  });
};

notificationTemplateSchema.statics.getTemplateStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ["$isActive", 1, 0] },
        },
        totalUsage: { $sum: "$usage.totalSent" },
        avgSuccessRate: { $avg: "$usage.successRate" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

notificationTemplateSchema.statics.bulkUpdateStatus = function (
  templateIds,
  isActive
) {
  return this.updateMany({ _id: { $in: templateIds } }, { $set: { isActive } });
};

// Export the model
module.exports = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);
