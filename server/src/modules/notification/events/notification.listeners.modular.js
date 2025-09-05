/**
 * Modular Notification Event Listeners
 *
 * This file initializes all notification event listeners using the new modular architecture
 * It wraps the existing notification listeners to provide the modular interface
 */

const notificationListeners = require("./notification.listeners");

// Initialize notification event listeners
const initializeNotificationEventListeners = async () => {
  try {
    // Initialize the notification listeners with the event bus
    await notificationListeners.initializeListeners();
    notificationListeners.isInitialized = true;
    console.log("Notification event listeners initialized successfully");
  } catch (error) {
    console.error("Failed to initialize notification event listeners:", error);
    throw error;
  }
};

// Cleanup function for graceful shutdown
const cleanupNotificationEventListeners = async () => {
  try {
    // Remove all event listeners
    const eventEmitter = require("../../../shared/events/eventEmitter");
    const {
      USER_EVENTS,
      ORDER_EVENTS,
      PAYMENT_EVENTS,
      PRODUCT_EVENTS,
    } = require("../../../shared/events/eventDefinitions");

    // Remove all notification-related event listeners
    const eventsToRemove = [
      USER_EVENTS.USER_REGISTERED.name,
      USER_EVENTS.USER_LOGGED_IN.name,
      USER_EVENTS.USER_LOGIN_FAILED.name,
      USER_EVENTS.USER_ACCOUNT_LOCKED.name,
      USER_EVENTS.PASSWORD_CHANGED.name,
      USER_EVENTS.EMAIL_VERIFIED.name,
      // Add other events as needed
    ];

    eventsToRemove.forEach((eventName) => {
      eventEmitter.removeAllListeners(eventName);
    });

    console.log("Notification event listeners cleaned up successfully");
  } catch (error) {
    console.error("Failed to cleanup notification event listeners:", error);
    throw error;
  }
};

// Health check function
const getNotificationEventListenersHealth = async () => {
  try {
    // Check if the notification listeners instance exists
    const isHealthy =
      notificationListeners && typeof notificationListeners === "object";

    return {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      details: {
        listenersInitialized: isHealthy,
        instanceExists: !!notificationListeners,
      },
    };
  } catch (error) {
    return {
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

// Note: Auto-initialization removed to prevent circular dependency
// The event system manager will handle initialization

module.exports = {
  initializeNotificationEventListeners,
  cleanupNotificationEventListeners,
  getNotificationEventListenersHealth,
  notificationListeners,
};
