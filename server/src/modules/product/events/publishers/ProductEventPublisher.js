/**
 * Product Event Publisher
 *
 * Centralized class for publishing product-related events
 * Ensures consistent event structure and validation
 */

const eventEmitter = require("../../../../shared/events/eventEmitter");
const {
  PRODUCT_EVENTS,
  validateEventPayload,
} = require("../../../../shared/events/eventDefinitions");

class ProductEventPublisher {
  constructor() {
    this.eventEmitter = eventEmitter;
  }

  /**
   * Publish product created event
   */
  async publishProductCreated(product, createdBy) {
    const eventData = {
      productId: product._id?.toString?.() || product.productId,
      name: product.name,
      category: product.category?.toString?.() || product.category,
      price: product.basePrice || product.price,
      createdBy: createdBy?.toString?.() || createdBy,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(PRODUCT_EVENTS.PRODUCT_CREATED.name, eventData);

    return await this.eventEmitter.publish(
      PRODUCT_EVENTS.PRODUCT_CREATED.name,
      eventData
    );
  }

  /**
   * Publish product updated event
   */
  async publishProductUpdated(productId, changes, updatedBy) {
    const eventData = {
      productId: productId?.toString?.() || productId,
      changes,
      updatedBy: updatedBy?.toString?.() || updatedBy,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(PRODUCT_EVENTS.PRODUCT_UPDATED.name, eventData);

    return await this.eventEmitter.publish(
      PRODUCT_EVENTS.PRODUCT_UPDATED.name,
      eventData
    );
  }

  /**
   * Publish product deleted event
   */
  async publishProductDeleted(productId, deletedBy, reason = "manual") {
    const eventData = {
      productId: productId?.toString?.() || productId,
      deletedBy: deletedBy?.toString?.() || deletedBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    validateEventPayload(PRODUCT_EVENTS.PRODUCT_DELETED.name, eventData);

    return await this.eventEmitter.publish(
      PRODUCT_EVENTS.PRODUCT_DELETED.name,
      eventData
    );
  }
}

module.exports = ProductEventPublisher;

