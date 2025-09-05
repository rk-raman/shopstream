/**
 * Event Bus Factory
 *
 * Creates and configures the appropriate event bus implementation
 * based on environment configuration
 */

const EventEmitterBus = require("./implementations/eventEmitterBus");
const KafkaBus = require("./implementations/kafkaBus");

class EventBusFactory {
  static create(options = {}) {
    const eventBusType = process.env.EVENT_BUS_TYPE || "eventemitter";

    switch (eventBusType.toLowerCase()) {
      case "eventemitter":
        return new EventEmitterBus(options);

      case "kafka":
        return new KafkaBus(options);

      default:
        throw new Error(`Unsupported event bus type: ${eventBusType}`);
    }
  }

  static async createAndInitialize(options = {}) {
    const eventBus = this.create(options);
    await eventBus.initialize();
    return eventBus;
  }
}

module.exports = EventBusFactory;
