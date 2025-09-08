const { EventEmitter } = require("events");
const { CART_EVENTS } = require("../../../shared/events/eventTypes");

// Cart Event Publisher
class CartEventPublisher extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for multiple subscribers
  }

  // Item management events
  publishItemAdded(data) {
    this.emit(CART_EVENTS.ITEM_ADDED_TO_CART, {
      eventType: CART_EVENTS.ITEM_ADDED_TO_CART,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishItemRemoved(data) {
    this.emit(CART_EVENTS.ITEM_REMOVED_FROM_CART, {
      eventType: CART_EVENTS.ITEM_REMOVED_FROM_CART,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishItemQuantityUpdated(data) {
    this.emit(CART_EVENTS.ITEM_QUANTITY_UPDATED, {
      eventType: CART_EVENTS.ITEM_QUANTITY_UPDATED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishCartCleared(data) {
    this.emit(CART_EVENTS.CART_CLEARED, {
      eventType: CART_EVENTS.CART_CLEARED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  // Cart lifecycle events
  publishCartCreated(data) {
    this.emit(CART_EVENTS.CART_CREATED, {
      eventType: CART_EVENTS.CART_CREATED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishCartUpdated(data) {
    this.emit(CART_EVENTS.CART_UPDATED, {
      eventType: CART_EVENTS.CART_UPDATED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishCartSynchronized(data) {
    this.emit(CART_EVENTS.CART_SYNCHRONIZED, {
      eventType: CART_EVENTS.CART_SYNCHRONIZED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  // Cart behavior events
  publishCartAbandoned(data) {
    this.emit(CART_EVENTS.CART_ABANDONED, {
      eventType: CART_EVENTS.CART_ABANDONED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishCartRecovered(data) {
    this.emit(CART_EVENTS.CART_RECOVERED, {
      eventType: CART_EVENTS.CART_RECOVERED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishCheckoutInitiated(data) {
    this.emit(CART_EVENTS.CART_CHECKOUT_INITIATED, {
      eventType: CART_EVENTS.CART_CHECKOUT_INITIATED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  // Coupon events
  publishCouponApplied(data) {
    this.emit(CART_EVENTS.COUPON_APPLIED, {
      eventType: CART_EVENTS.COUPON_APPLIED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishCouponRemoved(data) {
    this.emit(CART_EVENTS.COUPON_REMOVED, {
      eventType: CART_EVENTS.COUPON_REMOVED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  // Analytics events
  publishCartValueChanged(data) {
    this.emit(CART_EVENTS.CART_VALUE_CHANGED, {
      eventType: CART_EVENTS.CART_VALUE_CHANGED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }

  publishCartItemsCountChanged(data) {
    this.emit(CART_EVENTS.CART_ITEMS_COUNT_CHANGED, {
      eventType: CART_EVENTS.CART_ITEMS_COUNT_CHANGED,
      timestamp: new Date().toISOString(),
      ...data,
    });
  }
}

// Export singleton instance
const cartEventPublisher = new CartEventPublisher();

module.exports = {
  CartEventPublisher,
  cartEventPublisher,
  CART_EVENTS,
};
