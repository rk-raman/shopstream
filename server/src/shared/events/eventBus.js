/**
 * Event Bus Abstraction Layer
 *
 * This provides a unified interface for event publishing and subscribing
 * that can be easily swapped between different implementations:
 * - In-memory EventEmitter (current)
 * - Kafka
 * - RabbitMQ
 * - NATS
 * - Redis Pub/Sub
 */

class EventBusInterface {
  /**
   * Publish an event
   * @param {string} eventType - The event type/name
   * @param {Object} data - Event payload
   * @param {Object} options - Additional options (metadata, routing, etc.)
   */
  async publish(eventType, data, options = {}) {
    throw new Error("publish method must be implemented by concrete class");
  }

  /**
   * Subscribe to an event
   * @param {string} eventType - The event type/name to subscribe to
   * @param {Function} handler - Event handler function
   * @param {Object} options - Subscription options (group, durable, etc.)
   */
  async subscribe(eventType, handler, options = {}) {
    throw new Error("subscribe method must be implemented by concrete class");
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventType - The event type/name
   * @param {Function} handler - Specific handler to remove (optional)
   */
  async unsubscribe(eventType, handler = null) {
    throw new Error("unsubscribe method must be implemented by concrete class");
  }

  /**
   * Initialize the event bus
   */
  async initialize() {
    throw new Error("initialize method must be implemented by concrete class");
  }

  /**
   * Gracefully shutdown the event bus
   */
  async shutdown() {
    throw new Error("shutdown method must be implemented by concrete class");
  }

  /**
   * Get event bus health status
   */
  async getHealth() {
    throw new Error("getHealth method must be implemented by concrete class");
  }
}

module.exports = EventBusInterface;
