const PaymentAnalyticsSubscriber = require("./PaymentAnalyticsSubscriber");
const PaymentNotificationSubscriber = require("./PaymentNotificationSubscriber");
const PaymentCacheSubscriber = require("./PaymentCacheSubscriber");

class PaymentSubscriberManager {
  constructor() {
    this.subscribers = new Map();
    this.isInitialized = false;
    this.eventEmitter = null;

    // Initialize all subscribers
    this.initializeSubscribers();
  }

  // Initialize all subscriber instances
  initializeSubscribers() {
    try {
      // Create subscriber instances
      const analyticsSubscriber = new PaymentAnalyticsSubscriber();
      const notificationSubscriber = new PaymentNotificationSubscriber();
      const cacheSubscriber = new PaymentCacheSubscriber();

      // Register subscribers
      this.subscribers.set("analytics", analyticsSubscriber);
      this.subscribers.set("notification", notificationSubscriber);
      this.subscribers.set("cache", cacheSubscriber);

      console.log("Payment subscribers initialized successfully");
    } catch (error) {
      console.error("Error initializing payment subscribers:", error);
      throw error;
    }
  }

  // Initialize all subscribers with event emitter
  async initialize(eventEmitter) {
    try {
      if (this.isInitialized) {
        console.log("Payment subscribers already initialized");
        return;
      }

      this.eventEmitter = eventEmitter;

      // Initialize each subscriber
      for (const [name, subscriber] of this.subscribers) {
        try {
          await subscriber.initialize(eventEmitter);
          console.log(`${name} subscriber initialized successfully`);
        } catch (error) {
          console.error(`Error initializing ${name} subscriber:`, error);
          // Continue with other subscribers even if one fails
        }
      }

      this.isInitialized = true;
      console.log("All payment subscribers initialized successfully");
    } catch (error) {
      console.error("Error initializing payment subscribers:", error);
      throw error;
    }
  }

  // Get subscriber by name
  getSubscriber(name) {
    return this.subscribers.get(name);
  }

  // Get all subscribers
  getAllSubscribers() {
    return Array.from(this.subscribers.values());
  }

  // Get subscriber names
  getSubscriberNames() {
    return Array.from(this.subscribers.keys());
  }

  // Shutdown a specific subscriber
  async shutdownSubscriber(name) {
    try {
      const subscriber = this.subscribers.get(name);
      if (subscriber && typeof subscriber.shutdown === "function") {
        await subscriber.shutdown();
        console.log(`${name} subscriber shut down successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error shutting down ${name} subscriber:`, error);
      return false;
    }
  }

  // Restart a specific subscriber
  async restartSubscriber(name) {
    try {
      const subscriber = this.subscribers.get(name);
      if (subscriber) {
        // Shutdown first
        if (typeof subscriber.shutdown === "function") {
          await subscriber.shutdown();
        }

        // Restart
        if (typeof subscriber.restart === "function") {
          await subscriber.restart();
        }

        // Re-initialize if event emitter is available
        if (this.eventEmitter && typeof subscriber.initialize === "function") {
          await subscriber.initialize(this.eventEmitter);
        }

        console.log(`${name} subscriber restarted successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error restarting ${name} subscriber:`, error);
      return false;
    }
  }

  // Shutdown all subscribers
  async shutdown() {
    try {
      console.log("Shutting down all payment subscribers...");

      const shutdownPromises = [];
      for (const [name, subscriber] of this.subscribers) {
        if (typeof subscriber.shutdown === "function") {
          shutdownPromises.push(
            subscriber.shutdown().catch((error) => {
              console.error(`Error shutting down ${name} subscriber:`, error);
            })
          );
        }
      }

      await Promise.all(shutdownPromises);
      this.isInitialized = false;
      this.eventEmitter = null;

      console.log("All payment subscribers shut down successfully");
    } catch (error) {
      console.error("Error shutting down payment subscribers:", error);
      throw error;
    }
  }

  // Restart all subscribers
  async restart() {
    try {
      console.log("Restarting all payment subscribers...");

      // Shutdown all first
      await this.shutdown();

      // Re-initialize if event emitter was previously set
      if (this.eventEmitter) {
        await this.initialize(this.eventEmitter);
      }

      console.log("All payment subscribers restarted successfully");
    } catch (error) {
      console.error("Error restarting payment subscribers:", error);
      throw error;
    }
  }

  // Get health status of all subscribers
  getHealthStatus() {
    const status = {
      isInitialized: this.isInitialized,
      totalSubscribers: this.subscribers.size,
      subscribers: {},
      summary: {
        active: 0,
        inactive: 0,
        error: 0,
      },
    };

    for (const [name, subscriber] of this.subscribers) {
      try {
        const subscriberStatus =
          typeof subscriber.getStatus === "function"
            ? subscriber.getStatus()
            : { name, isActive: true, type: "unknown" };

        status.subscribers[name] = subscriberStatus;

        if (subscriberStatus.isActive) {
          status.summary.active++;
        } else {
          status.summary.inactive++;
        }
      } catch (error) {
        status.subscribers[name] = {
          name,
          isActive: false,
          error: error.message,
          type: "error",
        };
        status.summary.error++;
      }
    }

    return status;
  }

  // Check if all subscribers are healthy
  isHealthy() {
    try {
      const status = this.getHealthStatus();
      return (
        status.isInitialized &&
        status.summary.error === 0 &&
        status.summary.active > 0
      );
    } catch (error) {
      console.error("Error checking subscriber health:", error);
      return false;
    }
  }

  // Get detailed subscriber information
  getSubscriberInfo() {
    const info = {
      manager: {
        isInitialized: this.isInitialized,
        hasEventEmitter: !!this.eventEmitter,
        totalSubscribers: this.subscribers.size,
      },
      subscribers: [],
    };

    for (const [name, subscriber] of this.subscribers) {
      const subscriberInfo = {
        name,
        className: subscriber.constructor.name,
        hasInitialize: typeof subscriber.initialize === "function",
        hasShutdown: typeof subscriber.shutdown === "function",
        hasRestart: typeof subscriber.restart === "function",
        hasGetStatus: typeof subscriber.getStatus === "function",
      };

      try {
        if (typeof subscriber.getStatus === "function") {
          subscriberInfo.status = subscriber.getStatus();
        }
      } catch (error) {
        subscriberInfo.statusError = error.message;
      }

      info.subscribers.push(subscriberInfo);
    }

    return info;
  }

  // Enable a specific subscriber
  async enableSubscriber(name) {
    try {
      const subscriber = this.subscribers.get(name);
      if (subscriber && typeof subscriber.restart === "function") {
        await subscriber.restart();

        // Re-initialize if event emitter is available
        if (this.eventEmitter && typeof subscriber.initialize === "function") {
          await subscriber.initialize(this.eventEmitter);
        }

        console.log(`${name} subscriber enabled successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error enabling ${name} subscriber:`, error);
      return false;
    }
  }

  // Disable a specific subscriber
  async disableSubscriber(name) {
    try {
      const subscriber = this.subscribers.get(name);
      if (subscriber && typeof subscriber.shutdown === "function") {
        await subscriber.shutdown();
        console.log(`${name} subscriber disabled successfully`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error disabling ${name} subscriber:`, error);
      return false;
    }
  }

  // Add a new subscriber dynamically
  addSubscriber(name, subscriberInstance) {
    try {
      if (this.subscribers.has(name)) {
        throw new Error(`Subscriber with name '${name}' already exists`);
      }

      this.subscribers.set(name, subscriberInstance);

      // Initialize immediately if manager is already initialized
      if (
        this.isInitialized &&
        this.eventEmitter &&
        typeof subscriberInstance.initialize === "function"
      ) {
        subscriberInstance.initialize(this.eventEmitter);
      }

      console.log(`Subscriber '${name}' added successfully`);
      return true;
    } catch (error) {
      console.error(`Error adding subscriber '${name}':`, error);
      return false;
    }
  }

  // Remove a subscriber
  async removeSubscriber(name) {
    try {
      const subscriber = this.subscribers.get(name);
      if (!subscriber) {
        return false;
      }

      // Shutdown the subscriber first
      if (typeof subscriber.shutdown === "function") {
        await subscriber.shutdown();
      }

      this.subscribers.delete(name);
      console.log(`Subscriber '${name}' removed successfully`);
      return true;
    } catch (error) {
      console.error(`Error removing subscriber '${name}':`, error);
      return false;
    }
  }
}

// Create and export singleton instance
const paymentSubscriberManager = new PaymentSubscriberManager();

module.exports = {
  PaymentSubscriberManager,
  paymentSubscriberManager,

  // Export individual subscribers for direct access if needed
  PaymentAnalyticsSubscriber,
  PaymentNotificationSubscriber,
  PaymentCacheSubscriber,

  // Convenience methods
  initialize: (eventEmitter) =>
    paymentSubscriberManager.initialize(eventEmitter),
  shutdown: () => paymentSubscriberManager.shutdown(),
  restart: () => paymentSubscriberManager.restart(),
  getHealthStatus: () => paymentSubscriberManager.getHealthStatus(),
  isHealthy: () => paymentSubscriberManager.isHealthy(),
  getSubscriberInfo: () => paymentSubscriberManager.getSubscriberInfo(),
};
