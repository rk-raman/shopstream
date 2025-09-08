const CartAnalyticsSubscriber = require("./CartAnalyticsSubscriber");
const CartNotificationSubscriber = require("./CartNotificationSubscriber");
const CartCacheSubscriber = require("./CartCacheSubscriber");

class CartEventSubscribers {
  constructor() {
    this.subscribers = {};
    this.initializeSubscribers();
  }

  initializeSubscribers() {
    console.log("[Cart Events] Initializing cart event subscribers...");

    try {
      // Initialize all subscribers
      this.subscribers.analytics = new CartAnalyticsSubscriber();
      this.subscribers.notification = new CartNotificationSubscriber();
      this.subscribers.cache = new CartCacheSubscriber();

      console.log(
        "[Cart Events] All cart event subscribers initialized successfully"
      );

      // Log which events each subscriber is listening to
      this.logSubscriberInfo();
    } catch (error) {
      console.error(
        "[Cart Events] Error initializing cart event subscribers:",
        error
      );
      throw error;
    }
  }

  logSubscriberInfo() {
    console.log("[Cart Events] Active subscribers:");
    console.log(
      "  - CartAnalyticsSubscriber: Tracking cart metrics, user behavior, and conversion analytics"
    );
    console.log(
      "  - CartNotificationSubscriber: Managing cart-related notifications and alerts"
    );
    console.log(
      "  - CartCacheSubscriber: Handling cache invalidation and updates for cart data"
    );
  }

  getSubscriber(name) {
    return this.subscribers[name];
  }

  getAllSubscribers() {
    return this.subscribers;
  }

  // Method to gracefully shutdown subscribers if needed
  async shutdown() {
    console.log("[Cart Events] Shutting down cart event subscribers...");

    // If subscribers have cleanup methods, call them here
    for (const [name, subscriber] of Object.entries(this.subscribers)) {
      try {
        if (typeof subscriber.shutdown === "function") {
          await subscriber.shutdown();
          console.log(
            `[Cart Events] ${name} subscriber shut down successfully`
          );
        }
      } catch (error) {
        console.error(
          `[Cart Events] Error shutting down ${name} subscriber:`,
          error
        );
      }
    }

    console.log("[Cart Events] All cart event subscribers shut down");
  }

  // Method to check if all subscribers are healthy
  async healthCheck() {
    const health = {
      status: "healthy",
      subscribers: {},
      timestamp: new Date().toISOString(),
    };

    for (const [name, subscriber] of Object.entries(this.subscribers)) {
      try {
        // If subscriber has a health check method, use it
        if (typeof subscriber.healthCheck === "function") {
          health.subscribers[name] = await subscriber.healthCheck();
        } else {
          // Basic check - subscriber exists and has event emitter
          health.subscribers[name] = {
            status: subscriber.eventEmitter ? "healthy" : "unhealthy",
            initialized: !!subscriber.eventEmitter,
          };
        }
      } catch (error) {
        health.subscribers[name] = {
          status: "unhealthy",
          error: error.message,
        };
        health.status = "degraded";
      }
    }

    return health;
  }

  // Method to restart a specific subscriber
  async restartSubscriber(subscriberName) {
    console.log(`[Cart Events] Restarting ${subscriberName} subscriber...`);

    try {
      // Shutdown existing subscriber if it has a shutdown method
      const existingSubscriber = this.subscribers[subscriberName];
      if (
        existingSubscriber &&
        typeof existingSubscriber.shutdown === "function"
      ) {
        await existingSubscriber.shutdown();
      }

      // Reinitialize the subscriber
      switch (subscriberName) {
        case "analytics":
          this.subscribers.analytics = new CartAnalyticsSubscriber();
          break;
        case "notification":
          this.subscribers.notification = new CartNotificationSubscriber();
          break;
        case "cache":
          this.subscribers.cache = new CartCacheSubscriber();
          break;
        default:
          throw new Error(`Unknown subscriber: ${subscriberName}`);
      }

      console.log(
        `[Cart Events] ${subscriberName} subscriber restarted successfully`
      );
      return true;
    } catch (error) {
      console.error(
        `[Cart Events] Error restarting ${subscriberName} subscriber:`,
        error
      );
      throw error;
    }
  }

  // Method to get subscriber statistics
  getSubscriberStats() {
    const stats = {
      totalSubscribers: Object.keys(this.subscribers).length,
      subscriberNames: Object.keys(this.subscribers),
      eventListenerCounts: {},
      timestamp: new Date().toISOString(),
    };

    for (const [name, subscriber] of Object.entries(this.subscribers)) {
      if (
        subscriber.eventEmitter &&
        typeof subscriber.eventEmitter.listenerCount === "function"
      ) {
        stats.eventListenerCounts[name] =
          subscriber.eventEmitter.listenerCount();
      }
    }

    return stats;
  }

  // Method to enable/disable specific subscriber
  async toggleSubscriber(subscriberName, enabled) {
    console.log(
      `[Cart Events] ${
        enabled ? "Enabling" : "Disabling"
      } ${subscriberName} subscriber...`
    );

    try {
      const subscriber = this.subscribers[subscriberName];
      if (!subscriber) {
        throw new Error(`Subscriber ${subscriberName} not found`);
      }

      if (enabled) {
        // If disabled, reinitialize
        if (!subscriber.eventEmitter) {
          await this.restartSubscriber(subscriberName);
        }
      } else {
        // Disable by shutting down
        if (typeof subscriber.shutdown === "function") {
          await subscriber.shutdown();
        }
      }

      console.log(
        `[Cart Events] ${subscriberName} subscriber ${
          enabled ? "enabled" : "disabled"
        } successfully`
      );
      return true;
    } catch (error) {
      console.error(
        `[Cart Events] Error toggling ${subscriberName} subscriber:`,
        error
      );
      throw error;
    }
  }
}

// Create and export a singleton instance
const cartEventSubscribers = new CartEventSubscribers();

module.exports = {
  CartEventSubscribers,
  cartEventSubscribers,
  CartAnalyticsSubscriber,
  CartNotificationSubscriber,
  CartCacheSubscriber,
};
