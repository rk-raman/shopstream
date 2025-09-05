/**
 * Notification Module Entry Point
 *
 * This file initializes the notification module and ensures
 * all event listeners are properly set up
 */

// Import and initialize event listeners
require("./events/notification.listeners");

// Export the main components
module.exports = {
  // Models
  Notification: require("./models/Notification.model"),
  NotificationTemplate: require("./models/NotificationTemplate.model"),

  // Services
  notificationService: require("./services/notification.service"),
  emailService: require("./services/email.service"),
  smsService: require("./services/sms.service"),
  pushService: require("./services/push.service"),

  // Controllers
  notificationController: require("./controllers/notification.controller"),
  templateController: require("./controllers/template.controller"),

  // Routes
  notificationRoutes: require("./routes/notification.routes"),

  // Event Publisher
  NotificationEventPublisher: require("./events/publishers/NotificationEventPublisher"),
};
