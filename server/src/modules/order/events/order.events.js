const EventEmitter = require("events");

// Order Event Types
const ORDER_EVENTS = {
  // Order lifecycle events
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CONFIRMED: "order.confirmed",
  ORDER_SHIPPED: "order.shipped",
  ORDER_DELIVERED: "order.delivered",
  ORDER_CANCELLED: "order.cancelled",

  // Payment events
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESSFUL: "payment.successful",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_REFUNDED: "payment.refunded",

  // Return and exchange events
  RETURN_REQUESTED: "return.requested",
  RETURN_APPROVED: "return.approved",
  RETURN_REJECTED: "return.rejected",

  // Tracking events
  ORDER_TRACKING_UPDATED: "order.tracking.updated",
  ORDER_TRACKING_EVENT: "order.tracking.event",

  // Inventory events
  INVENTORY_RESERVED: "inventory.reserved",
  INVENTORY_RELEASED: "inventory.released",

  // Analytics events
  ORDER_ANALYTICS: "order.analytics",
  ORDER_METRICS: "order.metrics",

  // Notification events
  ORDER_NOTIFICATION: "order.notification",

  // Bulk operations
  BULK_ORDERS_UPDATED: "bulk.orders.updated",

  // Error events
  ORDER_ERROR: "order.error",
};

class OrderEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for multiple subscribers
  }

  // Order lifecycle events
  emitOrderCreated(data) {
    this.emit(ORDER_EVENTS.ORDER_CREATED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_CREATED,
    });
  }

  emitOrderUpdated(data) {
    this.emit(ORDER_EVENTS.ORDER_UPDATED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_UPDATED,
    });
  }

  emitOrderConfirmed(data) {
    this.emit(ORDER_EVENTS.ORDER_CONFIRMED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_CONFIRMED,
    });
  }

  emitOrderShipped(data) {
    this.emit(ORDER_EVENTS.ORDER_SHIPPED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_SHIPPED,
    });
  }

  emitOrderDelivered(data) {
    this.emit(ORDER_EVENTS.ORDER_DELIVERED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_DELIVERED,
    });
  }

  emitOrderCancelled(data) {
    this.emit(ORDER_EVENTS.ORDER_CANCELLED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_CANCELLED,
    });
  }

  // Payment events
  emitPaymentInitiated(data) {
    this.emit(ORDER_EVENTS.PAYMENT_INITIATED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.PAYMENT_INITIATED,
    });
  }

  emitPaymentSuccessful(data) {
    this.emit(ORDER_EVENTS.PAYMENT_SUCCESSFUL, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.PAYMENT_SUCCESSFUL,
    });
  }

  emitPaymentFailed(data) {
    this.emit(ORDER_EVENTS.PAYMENT_FAILED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.PAYMENT_FAILED,
    });
  }

  emitPaymentRefunded(data) {
    this.emit(ORDER_EVENTS.PAYMENT_REFUNDED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.PAYMENT_REFUNDED,
    });
  }

  // Return and exchange events
  emitReturnRequested(data) {
    this.emit(ORDER_EVENTS.RETURN_REQUESTED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.RETURN_REQUESTED,
    });
  }

  emitReturnApproved(data) {
    this.emit(ORDER_EVENTS.RETURN_APPROVED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.RETURN_APPROVED,
    });
  }

  emitReturnRejected(data) {
    this.emit(ORDER_EVENTS.RETURN_REJECTED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.RETURN_REJECTED,
    });
  }

  // Tracking events
  emitTrackingUpdated(data) {
    this.emit(ORDER_EVENTS.ORDER_TRACKING_UPDATED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_TRACKING_UPDATED,
    });
  }

  emitTrackingEvent(data) {
    this.emit(ORDER_EVENTS.ORDER_TRACKING_EVENT, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_TRACKING_EVENT,
    });
  }

  // Inventory events
  emitInventoryReserved(data) {
    this.emit(ORDER_EVENTS.INVENTORY_RESERVED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.INVENTORY_RESERVED,
    });
  }

  emitInventoryReleased(data) {
    this.emit(ORDER_EVENTS.INVENTORY_RELEASED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.INVENTORY_RELEASED,
    });
  }

  // Analytics events
  emitOrderAnalytics(data) {
    this.emit(ORDER_EVENTS.ORDER_ANALYTICS, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_ANALYTICS,
    });
  }

  emitOrderMetrics(data) {
    this.emit(ORDER_EVENTS.ORDER_METRICS, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_METRICS,
    });
  }

  // Notification events
  emitOrderNotification(data) {
    this.emit(ORDER_EVENTS.ORDER_NOTIFICATION, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_NOTIFICATION,
    });
  }

  // Bulk operations
  emitBulkOrdersUpdated(data) {
    this.emit(ORDER_EVENTS.BULK_ORDERS_UPDATED, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.BULK_ORDERS_UPDATED,
    });
  }

  // Error events
  emitOrderError(data) {
    this.emit(ORDER_EVENTS.ORDER_ERROR, {
      ...data,
      timestamp: new Date().toISOString(),
      eventType: ORDER_EVENTS.ORDER_ERROR,
    });
  }

  // Utility methods
  getEventTypes() {
    return Object.values(ORDER_EVENTS);
  }

  getListenerCount(eventType) {
    return this.listenerCount(eventType);
  }

  getAllListeners() {
    const listeners = {};
    this.getEventTypes().forEach((eventType) => {
      listeners[eventType] = this.listenerCount(eventType);
    });
    return listeners;
  }

  // Health check method
  isHealthy() {
    try {
      // Check if event emitter is working
      this.emit("health-check", { timestamp: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error("Order event emitter health check failed:", error);
      return false;
    }
  }
}

// Create singleton instance
const orderEventEmitter = new OrderEventEmitter();

// Error handling for the event emitter
orderEventEmitter.on("error", (error) => {
  console.error("Order Event Emitter Error:", error);
});

// Log unhandled events in development
if (process.env.NODE_ENV === "development") {
  orderEventEmitter.on("newListener", (eventType, listener) => {
    console.log(`New listener added for event: ${eventType}`);
  });

  orderEventEmitter.on("removeListener", (eventType, listener) => {
    console.log(`Listener removed for event: ${eventType}`);
  });
}

module.exports = {
  orderEventEmitter,
  ORDER_EVENTS,
  OrderEventEmitter,
};
