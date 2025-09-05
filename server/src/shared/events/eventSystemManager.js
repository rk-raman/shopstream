/**
 * Event System Manager
 *
 * Centralized manager for initializing and cleaning up all event-driven modules
 * This keeps the main application files clean and provides a single point of control
 */

const EventBusFactory = require("./eventBusFactory");

class EventSystemManager {
  constructor() {
    this.eventBus = null;
    this.initializedModules = new Set();
    this.isInitialized = false;
  }

  /**
   * Initialize the entire event-driven architecture
   */
  async initialize(options = {}) {
    if (this.isInitialized) {
      console.log("Event system already initialized");
      return;
    }

    try {
      console.log("Initializing event-driven architecture...");

      // Initialize event bus
      this.eventBus = await EventBusFactory.createAndInitialize({
        maxListeners: 100,
        ...options,
      });

      // Initialize all modules
      await this.initializeAllModules();

      this.isInitialized = true;
      console.log("Event-driven architecture initialized successfully");
    } catch (error) {
      console.error("Failed to initialize event-driven architecture:", error);
      throw error;
    }
  }

  /**
   * Initialize all event-driven modules
   */
  async initializeAllModules() {
    const modules = [
      { name: "user", path: "../modules/user/events/user.listeners.modular" },
      // Add more modules here as they are implemented
      // { name: 'product', path: './modules/product/events/product.listeners.modular' },
      // { name: 'order', path: './modules/order/events/order.listeners.modular' },
      // { name: 'payment', path: './modules/payment/events/payment.listeners.modular' },
      // { name: 'inventory', path: './modules/inventory/events/inventory.listeners.modular' },
      // { name: 'notification', path: './modules/notification/events/notification.listeners.modular' },
      // { name: 'review', path: './modules/review/events/review.listeners.modular' },
      // { name: 'analytics', path: './modules/analytics/events/analytics.listeners.modular' },
    ];

    for (const module of modules) {
      try {
        console.log(`Initializing ${module.name} event listeners...`);

        const modulePath = require.resolve(module.path);
        const { initializeUserEventListeners } = require(modulePath);

        if (typeof initializeUserEventListeners === "function") {
          await initializeUserEventListeners();
          this.initializedModules.add(module.name);
          console.log(
            `${module.name} event listeners initialized successfully`
          );
        } else {
          console.warn(
            `No initialization function found for ${module.name} module`
          );
        }
      } catch (error) {
        console.error(
          `Failed to initialize ${module.name} event listeners:`,
          error
        );
        // Continue with other modules even if one fails
      }
    }
  }

  /**
   * Cleanup all event-driven modules
   */
  async cleanup() {
    if (!this.isInitialized) {
      console.log("Event system not initialized, nothing to cleanup");
      return;
    }

    try {
      console.log("Cleaning up event-driven architecture...");

      // Cleanup all modules
      await this.cleanupAllModules();

      // Shutdown event bus
      if (this.eventBus) {
        await this.eventBus.shutdown();
        this.eventBus = null;
      }

      this.initializedModules.clear();
      this.isInitialized = false;
      console.log("Event-driven architecture cleaned up successfully");
    } catch (error) {
      console.error("Failed to cleanup event-driven architecture:", error);
      throw error;
    }
  }

  /**
   * Cleanup all event-driven modules
   */
  async cleanupAllModules() {
    const modules = [
      { name: "user", path: "./modules/user/events/user.listeners.modular" },
      // Add more modules here as they are implemented
    ];

    for (const module of modules) {
      if (this.initializedModules.has(module.name)) {
        try {
          console.log(`Cleaning up ${module.name} event listeners...`);

          const modulePath = require.resolve(module.path);
          const { cleanupUserEventListeners } = require(modulePath);

          if (typeof cleanupUserEventListeners === "function") {
            await cleanupUserEventListeners();
            console.log(
              `${module.name} event listeners cleaned up successfully`
            );
          } else {
            console.warn(`No cleanup function found for ${module.name} module`);
          }
        } catch (error) {
          console.error(
            `Failed to cleanup ${module.name} event listeners:`,
            error
          );
          // Continue with other modules even if one fails
        }
      }
    }
  }

  /**
   * Get health status of the event system
   */
  async getHealth() {
    const health = {
      isInitialized: this.isInitialized,
      initializedModules: Array.from(this.initializedModules),
      eventBus: null,
      timestamp: new Date().toISOString(),
    };

    if (this.eventBus) {
      try {
        health.eventBus = await this.eventBus.getHealth();
      } catch (error) {
        health.eventBus = { status: "error", error: error.message };
      }
    }

    return health;
  }

  /**
   * Get the event bus instance
   */
  getEventBus() {
    return this.eventBus;
  }

  /**
   * Check if a specific module is initialized
   */
  isModuleInitialized(moduleName) {
    return this.initializedModules.has(moduleName);
  }

  /**
   * Get list of initialized modules
   */
  getInitializedModules() {
    return Array.from(this.initializedModules);
  }
}

// Export singleton instance
const eventSystemManager = new EventSystemManager();

module.exports = eventSystemManager;
