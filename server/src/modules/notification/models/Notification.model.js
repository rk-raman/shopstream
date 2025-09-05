const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const notificationSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    // Recipient Information
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    recipientType: {
      type: String,
      enum: {
        values: ["user", "admin", "seller", "all"],
        message: "Recipient type must be user, admin, seller, or all",
      },
      default: "user",
      index: true,
    },

    // Notification Type and Category
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
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
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
        message: "Invalid notification category",
      },
      default: "info",
      index: true,
    },

    // Delivery Channels
    channels: {
      email: {
        enabled: {
          type: Boolean,
          default: false,
        },
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        emailId: String,
        error: String,
      },
      sms: {
        enabled: {
          type: Boolean,
          default: false,
        },
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        messageId: String,
        error: String,
      },
      push: {
        enabled: {
          type: Boolean,
          default: false,
        },
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        deviceTokens: [String],
        error: String,
      },
      inApp: {
        enabled: {
          type: Boolean,
          default: true,
        },
        delivered: {
          type: Boolean,
          default: false,
        },
        deliveredAt: Date,
        read: {
          type: Boolean,
          default: false,
        },
        readAt: Date,
      },
    },

    // Priority and Scheduling
    priority: {
      type: String,
      enum: {
        values: ["low", "normal", "high", "urgent"],
        message: "Priority must be low, normal, high, or urgent",
      },
      default: "normal",
      index: true,
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },

    // Action and Navigation
    actionUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+\..+/.test(v) || v.startsWith("/");
        },
        message: "Please enter a valid URL",
      },
    },
    actionText: {
      type: String,
      trim: true,
      maxlength: [50, "Action text cannot exceed 50 characters"],
    },
    actionData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Related Data
    relatedEntity: {
      type: {
        type: String,
        enum: ["order", "product", "payment", "user", "review"],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },

    // Template Information
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationTemplate",
    },
    templateData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Status and Tracking
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "scheduled",
          "sent",
          "delivered",
          "failed",
          "cancelled",
        ],
        message: "Invalid notification status",
      },
      default: "pending",
      index: true,
    },
    deliveryAttempts: {
      type: Number,
      default: 0,
      max: [5, "Maximum delivery attempts exceeded"],
    },
    lastDeliveryAttempt: Date,

    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ["system", "admin", "user", "automated"],
        default: "system",
      },
      triggerEvent: String,
      userAgent: String,
      ipAddress: String,
      tags: [String],
      customData: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },

    // Analytics
    analytics: {
      opened: {
        type: Boolean,
        default: false,
      },
      openedAt: Date,
      clicked: {
        type: Boolean,
        default: false,
      },
      clickedAt: Date,
      dismissed: {
        type: Boolean,
        default: false,
      },
      dismissedAt: Date,
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

// Compound Indexes for better performance
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Text index for search functionality
notificationSchema.index({
  title: "text",
  message: "text",
  description: "text",
});

// Add pagination plugin
notificationSchema.plugin(mongoosePaginate);

// Virtual for notification age in hours
notificationSchema.virtual("ageInHours").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for delivery status
notificationSchema.virtual("deliveryStatus").get(function () {
  const channels = this.channels;
  const statuses = [];

  if (channels.email.enabled) {
    statuses.push(channels.email.sent ? "email_sent" : "email_pending");
  }
  if (channels.sms.enabled) {
    statuses.push(channels.sms.sent ? "sms_sent" : "sms_pending");
  }
  if (channels.push.enabled) {
    statuses.push(channels.push.sent ? "push_sent" : "push_pending");
  }
  if (channels.inApp.enabled) {
    statuses.push(
      channels.inApp.delivered ? "inapp_delivered" : "inapp_pending"
    );
  }

  return statuses;
});

// Virtual to check if notification is expired
notificationSchema.virtual("isExpired").get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual to check if notification is scheduled
notificationSchema.virtual("isScheduled").get(function () {
  return this.scheduledAt && this.scheduledAt > new Date();
});

// Pre-save middleware
notificationSchema.pre("save", async function (next) {
  try {
    // Set status based on scheduling
    if (this.scheduledAt && this.scheduledAt > new Date()) {
      this.status = "scheduled";
    } else if (this.status === "pending") {
      this.status = "pending";
    }

    // Set default expiration if not provided (30 days)
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    // Update last delivery attempt
    if (this.isModified("deliveryAttempts")) {
      this.lastDeliveryAttempt = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  this.analytics.opened = true;
  this.analytics.openedAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDelivered = function () {
  this.channels.inApp.delivered = true;
  this.channels.inApp.deliveredAt = new Date();
  this.status = "delivered";
  return this.save();
};

notificationSchema.methods.markAsClicked = function () {
  this.analytics.clicked = true;
  this.analytics.clickedAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDismissed = function () {
  this.analytics.dismissed = true;
  this.analytics.dismissedAt = new Date();
  return this.save();
};

notificationSchema.methods.incrementDeliveryAttempts = function () {
  this.deliveryAttempts += 1;
  this.lastDeliveryAttempt = new Date();
  return this.save();
};

notificationSchema.methods.markChannelAsSent = function (channel, data = {}) {
  if (this.channels[channel]) {
    this.channels[channel].sent = true;
    this.channels[channel].sentAt = new Date();

    if (data.messageId) this.channels[channel].messageId = data.messageId;
    if (data.emailId) this.channels[channel].emailId = data.emailId;
    if (data.deviceTokens)
      this.channels[channel].deviceTokens = data.deviceTokens;
    if (data.error) this.channels[channel].error = data.error;
  }
  return this.save();
};

notificationSchema.methods.markChannelAsFailed = function (channel, error) {
  if (this.channels[channel]) {
    this.channels[channel].error = error;
  }
  this.status = "failed";
  return this.save();
};

// Static methods
notificationSchema.statics.findByRecipient = function (
  recipientId,
  options = {}
) {
  const { page = 1, limit = 20, type, status, unreadOnly = false } = options;

  const filter = { recipient: recipientId };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (unreadOnly) filter["channels.inApp.read"] = false;

  return this.paginate(filter, {
    page,
    limit,
    sort: { createdAt: -1 },
    populate: "templateId",
  });
};

notificationSchema.statics.findScheduled = function () {
  return this.find({
    status: "scheduled",
    scheduledAt: { $lte: new Date() },
  });
};

notificationSchema.statics.findExpired = function () {
  return this.find({
    expiresAt: { $lt: new Date() },
    status: { $ne: "cancelled" },
  });
};

notificationSchema.statics.findPendingDelivery = function () {
  return this.find({
    status: "pending",
    $or: [
      { "channels.email.enabled": true, "channels.email.sent": false },
      { "channels.sms.enabled": true, "channels.sms.sent": false },
      { "channels.push.enabled": true, "channels.push.sent": false },
    ],
  });
};

notificationSchema.statics.getNotificationStats = function (recipientId) {
  return this.aggregate([
    { $match: { recipient: mongoose.Types.ObjectId(recipientId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: {
          $sum: {
            $cond: [{ $eq: ["$channels.inApp.read", false] }, 1, 0],
          },
        },
        byType: {
          $push: {
            type: "$type",
            category: "$category",
          },
        },
        byStatus: {
          $push: "$status",
        },
      },
    },
  ]);
};

notificationSchema.statics.bulkMarkAsRead = function (
  notificationIds,
  recipientId
) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: recipientId,
    },
    {
      $set: {
        "channels.inApp.read": true,
        "channels.inApp.readAt": new Date(),
        "analytics.opened": true,
        "analytics.openedAt": new Date(),
      },
    }
  );
};

notificationSchema.statics.bulkDelete = function (
  notificationIds,
  recipientId
) {
  return this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: recipientId,
    },
    {
      $set: {
        status: "cancelled",
        "analytics.dismissed": true,
        "analytics.dismissedAt": new Date(),
      },
    }
  );
};

// Export the model
module.exports = mongoose.model("Notification", notificationSchema);
