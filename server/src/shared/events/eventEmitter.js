/**
 * Legacy Event Emitter - Backward Compatibility
 *
 * This maintains backward compatibility with the existing codebase
 * while gradually migrating to the new event bus abstraction
 */

const EventBusFactory = require("./eventBusFactory");

// Create the event bus instance
let eventBus = null;

// Initialize event bus
const initializeEventBus = async () => {
  if (!eventBus) {
    eventBus = await EventBusFactory.createAndInitialize();
  }
  return eventBus;
};

// Legacy wrapper for backward compatibility
const eventEmitter = {
  // Initialize event listeners from all modules
  init() {
    // This is now handled by the event bus implementation
    console.log("Event system initialization delegated to event bus");
  },

  // Publish event (wrapper for event bus)
  async publish(eventType, data, options = {}) {
    if (!eventBus) {
      await initializeEventBus();
    }
    return await eventBus.publish(eventType, data, options);
  },

  // Subscribe to event (wrapper for event bus)
  async subscribe(eventType, handler, options = {}) {
    if (!eventBus) {
      await initializeEventBus();
    }
    return await eventBus.subscribe(eventType, handler, options);
  },

  // Legacy method for backward compatibility
  async publishToKafka(topic, message) {
    if (!eventBus) {
      await initializeEventBus();
    }
    return await eventBus.publish(topic, message);
  },

  // New methods for better control
  async initialize() {
    return await initializeEventBus();
  },

  async shutdown() {
    if (eventBus) {
      await eventBus.shutdown();
      eventBus = null;
    }
  },

  async getHealth() {
    if (!eventBus) {
      return { status: "not_initialized" };
    }
    return await eventBus.getHealth();
  },
};

// Auto-initialize for backward compatibility
initializeEventBus().catch(console.error);

module.exports = eventEmitter;
