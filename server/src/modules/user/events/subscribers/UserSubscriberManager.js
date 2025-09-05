/**
 * User Subscriber Manager
 *
 * Coordinates all user event subscribers and manages their lifecycle
 */

const UserNotificationSubscriber = require("./UserNotificationSubscriber");
const UserAnalyticsSubscriber = require("./UserAnalyticsSubscriber");
const UserMarketingSubscriber = require("./UserMarketingSubscriber");

class UserSubscriberManager {
  constructor() {
    this.subscribers = {
      notification: new UserNotificationSubscriber(),
      analytics: new UserAnalyticsSubscriber(),
      marketing: new UserMarketingSubscriber(),
    };
    this.isInitialized = false;
  }

  /**
   * Initialize all subscribers
   */
  async initialize() {
    if (this.isInitialized) {
      console.log("User subscriber manager already initialized");
      return;
    }

    try {
      console.log("Initializing user event subscribers...");

      // Initialize all subscribers in parallel
      await Promise.all([
        this.subscribers.notification.initialize(),
        this.subscribers.analytics.initialize(),
        this.subscribers.marketing.initialize(),
      ]);

      this.isInitialized = true;
      console.log("All user event subscribers initialized successfully");
    } catch (error) {
      console.error("Failed to initialize user event subscribers:", error);
      throw error;
    }
  }

  /**
   * Get subscriber by name
   */
  getSubscriber(name) {
    if (!this.subscribers[name]) {
      throw new Error(`Unknown subscriber: ${name}`);
    }
    return this.subscribers[name];
  }

  /**
   * Get all subscribers
   */
  getAllSubscribers() {
    return this.subscribers;
  }

  /**
   * Get subscriber status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      subscribers: Object.keys(this.subscribers).map((name) => ({
        name,
        isInitialized: this.isInitialized,
      })),
    };
  }

  /**
   * Cleanup all subscribers
   */
  async cleanup() {
    if (!this.isInitialized) {
      console.log(
        "User subscriber manager not initialized, nothing to cleanup"
      );
      return;
    }

    try {
      console.log("Cleaning up user event subscribers...");

      // Cleanup all subscribers in parallel
      await Promise.all([
        this.subscribers.notification.cleanup(),
        this.subscribers.analytics.cleanup(),
        this.subscribers.marketing.cleanup(),
      ]);

      this.isInitialized = false;
      console.log("All user event subscribers cleaned up successfully");
    } catch (error) {
      console.error("Failed to cleanup user event subscribers:", error);
      throw error;
    }
  }

  /**
   * Health check for all subscribers
   */
  async healthCheck() {
    const status = this.getStatus();

    if (!status.isInitialized) {
      return {
        status: "not_initialized",
        subscribers: status.subscribers,
      };
    }

    return {
      status: "healthy",
      subscribers: status.subscribers,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = UserSubscriberManager;
