const EventEmitter = require("events");
const eventTypes = require("./eventTypes");

class ECommerceEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase limit for multiple listeners
  }

  // Initialize event listeners from all modules
  init() {
    // Import all event listeners
    require("../../modules/user/events/user.listeners");
    require("../../modules/product/events/product.listeners");
    require("../../modules/order/events/order.listeners");
    require("../../modules/payment/events/payment.listeners");
    require("../../modules/inventory/events/inventory.listeners");
    require("../../modules/notification/events/notification.listeners");
    require("../../modules/review/events/review.listeners");
    require("../../modules/analytics/events/analytics.listeners");

    console.log("Event system initialized with all listeners");
  }

  // Publish event (wrapper for emit)
  publish(eventType, data) {
    console.log(`Publishing event: ${eventType}`, data);
    this.emit(eventType, data);
  }

  // Subscribe to event (wrapper for on)
  subscribe(eventType, handler) {
    this.on(eventType, handler);
  }

  // Future: Replace with Kafka publisher
  async publishToKafka(topic, message) {
    // TODO: Implement Kafka publisher when migrating to microservices
    // For now, use local event emitter
    this.publish(topic, message);
  }
}

// Export singleton instance
const eventEmitter = new ECommerceEventEmitter();
module.exports = eventEmitter;
