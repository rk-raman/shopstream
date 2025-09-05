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
      {
        name: "user",
        path: "../../modules/user/events/user.listeners.modular.js",
      },
      {
        name: "notification",
        path: "../../modules/notification/events/notification.listeners.modular.js",
      },
      // Add more modules here as they are implemented
      // { name: 'product', path: './modules/product/events/product.listeners.modular.js' },
      // { name: 'order', path: './modules/order/events/order.listeners.modular.js' },
      // { name: 'payment', path: './modules/payment/events/payment.listeners.modular.js' },
      // { name: 'inventory', path: './modules/inventory/events/inventory.listeners.modular.js' },
      // { name: 'review', path: './modules/review/events/review.listeners.modular.js' },
      // { name: 'analytics', path: './modules/analytics/events/analytics.listeners.modular.js' },
    ];

    for (const module of modules) {
      try {
        console.log(`Initializing ${module.name} event listeners...`);

        const modulePath = require.resolve(module.path);
        const moduleExports = require(modulePath);

        // Dynamic function name based on module name
        const initFunctionName = `initialize${
          module.name.charAt(0).toUpperCase() + module.name.slice(1)
        }EventListeners`;
        const initFunction = moduleExports[initFunctionName];

        if (typeof initFunction === "function") {
          await initFunction();
          this.initializedModules.add(module.name);
          console.log(
            `${module.name} event listeners initialized successfully`
          );
        } else {
          console.warn(
            `No initialization function found for ${module.name} module (looking for ${initFunctionName})`
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
      {
        name: "user",
        path: "../../modules/user/events/user.listeners.modular.js",
      },
      {
        name: "notification",
        path: "../../modules/notification/events/notification.listeners.modular.js",
      },
      // Add more modules here as they are implemented
    ];

    for (const module of modules) {
      if (this.initializedModules.has(module.name)) {
        try {
          console.log(`Cleaning up ${module.name} event listeners...`);

          const modulePath = require.resolve(module.path);
          const moduleExports = require(modulePath);

          // Dynamic function name based on module name
          const cleanupFunctionName = `cleanup${
            module.name.charAt(0).toUpperCase() + module.name.slice(1)
          }EventListeners`;
          const cleanupFunction = moduleExports[cleanupFunctionName];

          if (typeof cleanupFunction === "function") {
            await cleanupFunction();
            console.log(
              `${module.name} event listeners cleaned up successfully`
            );
          } else {
            console.warn(
              `No cleanup function found for ${module.name} module (looking for ${cleanupFunctionName})`
            );
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
