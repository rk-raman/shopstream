const UploadAnalyticsSubscriber = require("./UploadAnalyticsSubscriber");

class UploadSubscriberManager {
  constructor() {
    this.subscribers = new Map();
    this.isInitialized = false;
  }

  async initialize(eventEmitter) {
    try {
      if (this.isInitialized) {
        console.log("Upload subscribers already initialized");
        return;
      }

      console.log("Initializing upload subscribers...");

      // Initialize analytics subscriber
      const analyticsSubscriber = new UploadAnalyticsSubscriber();
      await analyticsSubscriber.initialize(eventEmitter);
      this.subscribers.set("analytics", analyticsSubscriber);

      this.isInitialized = true;
      console.log("Upload subscribers initialized successfully");
    } catch (error) {
      console.error("Error initializing upload subscribers:", error);
      throw error;
    }
  }

  async shutdown() {
    try {
      if (!this.isInitialized) {
        console.log("Upload subscribers not initialized, nothing to shutdown");
        return;
      }

      console.log("Shutting down upload subscribers...");

      for (const [name, subscriber] of this.subscribers) {
        try {
          await subscriber.shutdown();
          console.log(`${name} subscriber shut down successfully`);
        } catch (error) {
          console.error(`Error shutting down ${name} subscriber:`, error);
        }
      }

      this.subscribers.clear();
      this.isInitialized = false;
      console.log("Upload subscribers shut down successfully");
    } catch (error) {
      console.error("Error shutting down upload subscribers:", error);
      throw error;
    }
  }

  async restart(eventEmitter) {
    await this.shutdown();
    await this.initialize(eventEmitter);
  }

  getHealthStatus() {
    const status = {
      isInitialized: this.isInitialized,
      subscriberCount: this.subscribers.size,
      subscribers: {},
    };

    for (const [name, subscriber] of this.subscribers) {
      status.subscribers[name] = subscriber.getHealthStatus();
    }

    return status;
  }

  isHealthy() {
    if (!this.isInitialized) return false;

    for (const subscriber of this.subscribers.values()) {
      if (!subscriber.isActive) return false;
    }

    return true;
  }

  getSubscriberInfo() {
    return Array.from(this.subscribers.keys());
  }

  getSubscriber(name) {
    return this.subscribers.get(name);
  }
}

// Create singleton instance
const uploadSubscriberManager = new UploadSubscriberManager();

module.exports = uploadSubscriberManager;
