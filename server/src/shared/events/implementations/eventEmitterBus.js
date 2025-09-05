/**
 * EventEmitter-based Event Bus Implementation
 *
 * This is the current in-memory implementation using Node.js EventEmitter
 * Can be easily swapped with other implementations
 */

const EventEmitter = require("events");
const EventBusInterface = require("../eventBus");

class EventEmitterBus extends EventBusInterface {
  constructor(options = {}) {
    super();
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.setMaxListeners(options.maxListeners || 50);
    this.isInitialized = false;
    this.subscriptions = new Map(); // Track subscriptions for cleanup
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    // Initialize event listeners from all modules
    this._loadEventListeners();

    this.isInitialized = true;
    console.log("EventEmitter-based event bus initialized");
  }

  async publish(eventType, data, options = {}) {
    if (!this.isInitialized) {
      throw new Error("Event bus not initialized. Call initialize() first.");
    }

    const eventPayload = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      id: this._generateEventId(),
      ...options,
    };

    console.log(`Publishing event: ${eventType}`, {
      eventId: eventPayload.id,
      timestamp: eventPayload.timestamp,
    });

    this.eventEmitter.emit(eventType, eventPayload);

    return eventPayload.id;
  }

  async subscribe(eventType, handler, options = {}) {
    if (!this.isInitialized) {
      throw new Error("Event bus not initialized. Call initialize() first.");
    }

    const subscriptionId = this._generateSubscriptionId();
    const wrappedHandler = this._wrapHandler(
      handler,
      subscriptionId,
      eventType
    );

    this.eventEmitter.on(eventType, wrappedHandler);

    // Track subscription for cleanup
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Map());
    }
    this.subscriptions.get(eventType).set(subscriptionId, wrappedHandler);

    console.log(
      `Subscribed to event: ${eventType} (subscription: ${subscriptionId})`
    );

    return subscriptionId;
  }

  async unsubscribe(eventType, handler = null) {
    if (handler) {
      // Remove specific handler
      this.eventEmitter.removeListener(eventType, handler);
    } else {
      // Remove all handlers for this event type
      this.eventEmitter.removeAllListeners(eventType);
      if (this.subscriptions.has(eventType)) {
        this.subscriptions.delete(eventType);
      }
    }

    console.log(`Unsubscribed from event: ${eventType}`);
  }

  async shutdown() {
    this.eventEmitter.removeAllListeners();
    this.subscriptions.clear();
    this.isInitialized = false;
    console.log("EventEmitter-based event bus shutdown");
  }

  async getHealth() {
    return {
      status: this.isInitialized ? "healthy" : "not_initialized",
      type: "eventemitter",
      listeners: this.eventEmitter.listenerCount(),
      subscriptions: this.subscriptions.size,
    };
  }

  /**
   * Load all event listeners from modules
   * @private
   */
  _loadEventListeners() {
    try {
      // Note: Event listeners are now loaded by the eventSystemManager
      // to avoid circular dependencies. The eventSystemManager handles
      // initialization of all event-driven modules.
      console.log("Event listeners will be loaded by eventSystemManager");
    } catch (error) {
      console.error("Error loading event listeners:", error);
      throw error;
    }
  }

  /**
   * Wrap handler with error handling and logging
   * @private
   */
  _wrapHandler(originalHandler, subscriptionId, eventType) {
    return async (eventPayload) => {
      try {
        console.log(
          `Processing event: ${eventType} (subscription: ${subscriptionId})`
        );
        await originalHandler(eventPayload);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);

        // Emit error event for monitoring
        this.eventEmitter.emit("event_handler_error", {
          eventType,
          subscriptionId,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }

  /**
   * Generate unique event ID
   * @private
   */
  _generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique subscription ID
   * @private
   */
  _generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = EventEmitterBus;
