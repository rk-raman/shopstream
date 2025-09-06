/**
 * Product Analytics Subscriber
 *
 * Tracks analytics for product lifecycle events
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const { PRODUCT_EVENTS } = require("../../../../shared/events/eventDefinitions");

class ProductAnalyticsSubscriber {
  constructor() {
    this.eventEmitter = eventEmitter;
    this.subscriptions = [];
  }

  async initialize() {
    await this.subscribeToProductCreated();
    await this.subscribeToProductUpdated();
    await this.subscribeToProductDeleted();
    console.log("Product analytics subscriber initialized");
  }

  async subscribeToProductCreated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      PRODUCT_EVENTS.PRODUCT_CREATED.name,
      async (eventPayload) => {
        console.log("Product created - tracking analytics:", eventPayload.data);
        await this.eventEmitter.publish("analytics.product_created", {
          productId: eventPayload.data.productId,
          name: eventPayload.data.name,
          category: eventPayload.data.category,
          price: eventPayload.data.price,
          createdBy: eventPayload.data.createdBy,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );
    this.subscriptions.push(subscriptionId);
  }

  async subscribeToProductUpdated() {
    const subscriptionId = await this.eventEmitter.subscribe(
      PRODUCT_EVENTS.PRODUCT_UPDATED.name,
      async (eventPayload) => {
        console.log("Product updated - tracking analytics:", eventPayload.data);
        await this.eventEmitter.publish("analytics.product_updated", {
          productId: eventPayload.data.productId,
          changes: eventPayload.data.changes,
          updatedBy: eventPayload.data.updatedBy,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );
    this.subscriptions.push(subscriptionId);
  }

  async subscribeToProductDeleted() {
    const subscriptionId = await this.eventEmitter.subscribe(
      PRODUCT_EVENTS.PRODUCT_DELETED.name,
      async (eventPayload) => {
        console.log("Product deleted - tracking analytics:", eventPayload.data);
        await this.eventEmitter.publish("analytics.product_deleted", {
          productId: eventPayload.data.productId,
          reason: eventPayload.data.reason,
          deletedBy: eventPayload.data.deletedBy,
          timestamp: eventPayload.timestamp,
          eventId: eventPayload.id,
        });
      }
    );
    this.subscriptions.push(subscriptionId);
  }

  async cleanup() {
    for (const subscriptionId of this.subscriptions) {
      console.log(`Cleaning up product analytics subscription: ${subscriptionId}`);
    }
    this.subscriptions = [];
  }
}

module.exports = ProductAnalyticsSubscriber;

