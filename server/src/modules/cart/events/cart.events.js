const { EventEmitter } = require("events");

// Cart Event Types
const CART_EVENTS = {
  // Item management events
  ITEM_ADDED_TO_CART: "cart.item.added",
  ITEM_REMOVED_FROM_CART: "cart.item.removed",
  ITEM_QUANTITY_UPDATED: "cart.item.quantity.updated",

  // Cart lifecycle events
  CART_CREATED: "cart.created",
  CART_UPDATED: "cart.updated",
  CART_CLEARED: "cart.cleared",
  CART_SYNCHRONIZED: "cart.synchronized",

  // Cart behavior events
  CART_ABANDONED: "cart.abandoned",
  CART_RECOVERED: "cart.recovered",
  CART_CHECKOUT_INITIATED: "cart.checkout.initiated",

  // Coupon events
  COUPON_APPLIED: "cart.coupon.applied",
  COUPON_REMOVED: "cart.coupon.removed",
  COUPON_EXPIRED: "cart.coupon.expired",

  // Analytics events
  CART_VALUE_CHANGED: "cart.value.changed",
  CART_ITEMS_COUNT_CHANGED: "cart.items.count.changed",
};

// Cart Event Emitter
class CartEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for multiple subscribers
  }

  // Item management events
  emitItemAdded(data) {
    this.emit(CART_EVENTS.ITEM_ADDED_TO_CART, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.ITEM_ADDED_TO_CART,
    });
  }

  emitItemRemoved(data) {
    this.emit(CART_EVENTS.ITEM_REMOVED_FROM_CART, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.ITEM_REMOVED_FROM_CART,
    });
  }

  emitItemQuantityUpdated(data) {
    this.emit(CART_EVENTS.ITEM_QUANTITY_UPDATED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.ITEM_QUANTITY_UPDATED,
    });
  }

  // Cart lifecycle events
  emitCartCreated(data) {
    this.emit(CART_EVENTS.CART_CREATED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_CREATED,
    });
  }

  emitCartUpdated(data) {
    this.emit(CART_EVENTS.CART_UPDATED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_UPDATED,
    });
  }

  emitCartCleared(data) {
    this.emit(CART_EVENTS.CART_CLEARED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_CLEARED,
    });
  }

  emitCartSynchronized(data) {
    this.emit(CART_EVENTS.CART_SYNCHRONIZED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_SYNCHRONIZED,
    });
  }

  // Cart behavior events
  emitCartAbandoned(data) {
    this.emit(CART_EVENTS.CART_ABANDONED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_ABANDONED,
    });
  }

  emitCartRecovered(data) {
    this.emit(CART_EVENTS.CART_RECOVERED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_RECOVERED,
    });
  }

  emitCheckoutInitiated(data) {
    this.emit(CART_EVENTS.CART_CHECKOUT_INITIATED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_CHECKOUT_INITIATED,
    });
  }

  // Coupon events
  emitCouponApplied(data) {
    this.emit(CART_EVENTS.COUPON_APPLIED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.COUPON_APPLIED,
    });
  }

  emitCouponRemoved(data) {
    this.emit(CART_EVENTS.COUPON_REMOVED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.COUPON_REMOVED,
    });
  }

  emitCouponExpired(data) {
    this.emit(CART_EVENTS.COUPON_EXPIRED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.COUPON_EXPIRED,
    });
  }

  // Analytics events
  emitCartValueChanged(data) {
    this.emit(CART_EVENTS.CART_VALUE_CHANGED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_VALUE_CHANGED,
    });
  }

  emitCartItemsCountChanged(data) {
    this.emit(CART_EVENTS.CART_ITEMS_COUNT_CHANGED, {
      ...data,
      timestamp: new Date(),
      eventType: CART_EVENTS.CART_ITEMS_COUNT_CHANGED,
    });
  }
}

// Create singleton instance
const cartEventEmitter = new CartEventEmitter();

module.exports = {
  CART_EVENTS,
  cartEventEmitter,
  CartEventEmitter,
};
