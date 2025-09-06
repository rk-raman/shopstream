/**
 * Product Notification Subscriber
 *
 * Handles notification-related side effects for product events
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const { PRODUCT_EVENTS } = require("../../../../shared/events/eventDefinitions");

class ProductNotificationSubscriber {
  constructor() {
    this.eventEmitter = eventEmitter;
    this.subscriptions = [];
  }

  async initialize() {
    await this.subscribeToProductCreated();
    await this.subscribeToProductUpdated();
    await this.subscribeToProductDeleted();
    console.log("Product notification subscriber initialized");
  }

  async subscribeToProductCreated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      PRODUCT_EVENTS.PRODUCT_CREATED.name,
      async (eventPayload) => {
        console.log("Product created - notifying subscribers:", eventPayload.data);

        await this.eventEmitter.publish("notification.send_email", {
          type: "product_created",
          to: "admin@system.local", // placeholder; resolve in real impl
          data: {
            productId: eventPayload.data.productId,
            name: eventPayload.data.name,
            category: eventPayload.data.category,
            price: eventPayload.data.price,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  async subscribeToProductUpdated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      PRODUCT_EVENTS.PRODUCT_UPDATED.name,
      async (eventPayload) => {
        console.log("Product updated - notifying subscribers:", eventPayload.data);

        await this.eventEmitter.publish("notification.send_email", {
          type: "product_updated",
          to: "admin@system.local",
          data: {
            productId: eventPayload.data.productId,
            changes: eventPayload.data.changes,
            updatedBy: eventPayload.data.updatedBy,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  async subscribeToProductDeleted() {
    const subscriptionId = await this.eventEmitter.subscribe(
      PRODUCT_EVENTS.PRODUCT_DELETED.name,
      async (eventPayload) => {
        console.log("Product deleted - notifying subscribers:", eventPayload.data);

        await this.eventEmitter.publish("notification.send_email", {
          type: "product_deleted",
          to: "admin@system.local",
          data: {
            productId: eventPayload.data.productId,
            reason: eventPayload.data.reason,
            deletedBy: eventPayload.data.deletedBy,
          },
          metadata: {
            eventId: eventPayload.id,
            timestamp: eventPayload.timestamp,
          },
        });
      }
    );

    this.subscriptions.push(subscriptionId);
  }

  async cleanup() {
    for (const subscriptionId of this.subscriptions) {
      console.log(`Cleaning up product notification subscription: ${subscriptionId}`);
    }
    this.subscriptions = [];
  }
}

module.exports = ProductNotificationSubscriber;

