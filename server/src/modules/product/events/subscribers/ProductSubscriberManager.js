/**
 * Product Subscriber Manager
 *
 * Coordinates all product event subscribers and manages their lifecycle
 */

const ProductNotificationSubscriber = require("./ProductNotificationSubscriber");
const ProductAnalyticsSubscriber = require("./ProductAnalyticsSubscriber");

class ProductSubscriberManager {
  constructor() {
    this.subscribers = {
      notification: new ProductNotificationSubscriber(),
      analytics: new ProductAnalyticsSubscriber(),
    };
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      console.log("Product subscriber manager already initialized");
      return;
    }

    try {
      console.log("Initializing product event subscribers...");

      await Promise.all([
        this.subscribers.notification.initialize(),
        this.subscribers.analytics.initialize(),
      ]);

      this.isInitialized = true;
      console.log("All product event subscribers initialized successfully");
    } catch (error) {
      console.error("Failed to initialize product event subscribers:", error);
      throw error;
    }
  }

  getSubscriber(name) {
    if (!this.subscribers[name]) {
      throw new Error(`Unknown subscriber: ${name}`);
    }
    return this.subscribers[name];
  }

  getAllSubscribers() {
    return this.subscribers;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      subscribers: Object.keys(this.subscribers).map((name) => ({
        name,
        isInitialized: this.isInitialized,
      })),
    };
  }

  async cleanup() {
    if (!this.isInitialized) {
      console.log(
        "Product subscriber manager not initialized, nothing to cleanup"
      );
      return;
    }

    try {
      console.log("Cleaning up product event subscribers...");

      await Promise.all([
        this.subscribers.notification.cleanup(),
        this.subscribers.analytics.cleanup(),
      ]);

      this.isInitialized = false;
      console.log("All product event subscribers cleaned up successfully");
    } catch (error) {
      console.error("Failed to cleanup product event subscribers:", error);
      throw error;
    }
  }

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

module.exports = ProductSubscriberManager;

