const ProductAnalyticsSubscriber = require("./ProductAnalyticsSubscriber");
const ProductNotificationSubscriber = require("./ProductNotificationSubscriber");
const ProductCacheSubscriber = require("./ProductCacheSubscriber");
const ProductSearchSubscriber = require("./ProductSearchSubscriber");
const ProductInventorySubscriber = require("./ProductInventorySubscriber");

class ProductEventSubscribers {
  constructor() {
    this.subscribers = {};
    this.initializeSubscribers();
  }

  initializeSubscribers() {
    console.log("[Product Events] Initializing product event subscribers...");

    try {
      // Initialize all subscribers
      this.subscribers.analytics = new ProductAnalyticsSubscriber();
      this.subscribers.notification = new ProductNotificationSubscriber();
      this.subscribers.cache = new ProductCacheSubscriber();
      this.subscribers.search = new ProductSearchSubscriber();
      this.subscribers.inventory = new ProductInventorySubscriber();

      console.log(
        "[Product Events] All product event subscribers initialized successfully"
      );

      // Log which events each subscriber is listening to
      this.logSubscriberInfo();
    } catch (error) {
      console.error(
        "[Product Events] Error initializing product event subscribers:",
        error
      );
      throw error;
    }
  }

  logSubscriberInfo() {
    console.log("[Product Events] Active subscribers:");
    console.log(
      "  - ProductAnalyticsSubscriber: Tracking product metrics and analytics"
    );
    console.log(
      "  - ProductNotificationSubscriber: Managing product-related notifications"
    );
    console.log(
      "  - ProductCacheSubscriber: Handling cache invalidation for product data"
    );
    console.log("  - ProductSearchSubscriber: Managing search index updates");
    console.log(
      "  - ProductInventorySubscriber: Handling inventory management and tracking"
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
    console.log("[Product Events] Shutting down product event subscribers...");

    // If subscribers have cleanup methods, call them here
    for (const [name, subscriber] of Object.entries(this.subscribers)) {
      try {
        if (typeof subscriber.shutdown === "function") {
          await subscriber.shutdown();
          console.log(
            `[Product Events] ${name} subscriber shut down successfully`
          );
        }
      } catch (error) {
        console.error(
          `[Product Events] Error shutting down ${name} subscriber:`,
          error
        );
      }
    }

    console.log("[Product Events] All product event subscribers shut down");
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
    console.log(`[Product Events] Restarting ${subscriberName} subscriber...`);

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
          this.subscribers.analytics = new ProductAnalyticsSubscriber();
          break;
        case "notification":
          this.subscribers.notification = new ProductNotificationSubscriber();
          break;
        case "cache":
          this.subscribers.cache = new ProductCacheSubscriber();
          break;
        case "search":
          this.subscribers.search = new ProductSearchSubscriber();
          break;
        case "inventory":
          this.subscribers.inventory = new ProductInventorySubscriber();
          break;
        default:
          throw new Error(`Unknown subscriber: ${subscriberName}`);
      }

      console.log(
        `[Product Events] ${subscriberName} subscriber restarted successfully`
      );
      return true;
    } catch (error) {
      console.error(
        `[Product Events] Error restarting ${subscriberName} subscriber:`,
        error
      );
      throw error;
    }
  }
}

// Create and export a singleton instance
const productEventSubscribers = new ProductEventSubscribers();

module.exports = {
  ProductEventSubscribers,
  productEventSubscribers,
  ProductAnalyticsSubscriber,
  ProductNotificationSubscriber,
  ProductCacheSubscriber,
  ProductSearchSubscriber,
  ProductInventorySubscriber,
};
