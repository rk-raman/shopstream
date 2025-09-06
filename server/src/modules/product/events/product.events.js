const { EventEmitter } = require("events");

// Product Event Types
const PRODUCT_EVENTS = {
  // Product lifecycle events
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",
  PRODUCT_APPROVED: "product.approved",
  PRODUCT_REJECTED: "product.rejected",
  PRODUCT_VIEWED: "product.viewed",

  // Stock events
  STOCK_UPDATED: "product.stock.updated",
  STOCK_LOW: "product.stock.low",
  STOCK_OUT: "product.stock.out",

  // Review events
  REVIEW_ADDED: "product.review.added",
  REVIEW_UPDATED: "product.review.updated",
  REVIEW_DELETED: "product.review.deleted",

  // Pricing events
  PRICE_CHANGED: "product.price.changed",
  DISCOUNT_APPLIED: "product.discount.applied",
  DISCOUNT_REMOVED: "product.discount.removed",

  // Variant events
  VARIANT_ADDED: "product.variant.added",
  VARIANT_UPDATED: "product.variant.updated",
  VARIANT_DELETED: "product.variant.deleted",

  // Bulk operations
  BULK_UPDATED: "products.bulk.updated",
  BULK_DELETED: "products.bulk.deleted",

  // Analytics events
  PRODUCT_SEARCHED: "product.searched",
  PRODUCT_WISHLISTED: "product.wishlisted",
  PRODUCT_CART_ADDED: "product.cart.added",
};

// Product Event Emitter
class ProductEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase max listeners for multiple subscribers
  }

  // Product lifecycle events
  emitProductCreated(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_CREATED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_CREATED,
    });
  }

  emitProductUpdated(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_UPDATED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_UPDATED,
    });
  }

  emitProductDeleted(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_DELETED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_DELETED,
    });
  }

  emitProductApproved(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_APPROVED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_APPROVED,
    });
  }

  emitProductRejected(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_REJECTED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_REJECTED,
    });
  }

  emitProductViewed(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_VIEWED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_VIEWED,
    });
  }

  // Stock events
  emitStockUpdated(data) {
    this.emit(PRODUCT_EVENTS.STOCK_UPDATED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.STOCK_UPDATED,
    });
  }

  emitStockLow(data) {
    this.emit(PRODUCT_EVENTS.STOCK_LOW, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.STOCK_LOW,
    });
  }

  emitStockOut(data) {
    this.emit(PRODUCT_EVENTS.STOCK_OUT, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.STOCK_OUT,
    });
  }

  // Review events
  emitReviewAdded(data) {
    this.emit(PRODUCT_EVENTS.REVIEW_ADDED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.REVIEW_ADDED,
    });
  }

  emitReviewUpdated(data) {
    this.emit(PRODUCT_EVENTS.REVIEW_UPDATED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.REVIEW_UPDATED,
    });
  }

  emitReviewDeleted(data) {
    this.emit(PRODUCT_EVENTS.REVIEW_DELETED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.REVIEW_DELETED,
    });
  }

  // Pricing events
  emitPriceChanged(data) {
    this.emit(PRODUCT_EVENTS.PRICE_CHANGED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRICE_CHANGED,
    });
  }

  emitDiscountApplied(data) {
    this.emit(PRODUCT_EVENTS.DISCOUNT_APPLIED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.DISCOUNT_APPLIED,
    });
  }

  emitDiscountRemoved(data) {
    this.emit(PRODUCT_EVENTS.DISCOUNT_REMOVED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.DISCOUNT_REMOVED,
    });
  }

  // Variant events
  emitVariantAdded(data) {
    this.emit(PRODUCT_EVENTS.VARIANT_ADDED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.VARIANT_ADDED,
    });
  }

  emitVariantUpdated(data) {
    this.emit(PRODUCT_EVENTS.VARIANT_UPDATED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.VARIANT_UPDATED,
    });
  }

  emitVariantDeleted(data) {
    this.emit(PRODUCT_EVENTS.VARIANT_DELETED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.VARIANT_DELETED,
    });
  }

  // Bulk operations
  emitBulkUpdated(data) {
    this.emit(PRODUCT_EVENTS.BULK_UPDATED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.BULK_UPDATED,
    });
  }

  emitBulkDeleted(data) {
    this.emit(PRODUCT_EVENTS.BULK_DELETED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.BULK_DELETED,
    });
  }

  // Analytics events
  emitProductSearched(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_SEARCHED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_SEARCHED,
    });
  }

  emitProductWishlisted(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_WISHLISTED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_WISHLISTED,
    });
  }

  emitProductCartAdded(data) {
    this.emit(PRODUCT_EVENTS.PRODUCT_CART_ADDED, {
      ...data,
      timestamp: new Date(),
      eventType: PRODUCT_EVENTS.PRODUCT_CART_ADDED,
    });
  }
}

// Create singleton instance
const productEventEmitter = new ProductEventEmitter();

module.exports = {
  PRODUCT_EVENTS,
  productEventEmitter,
  ProductEventEmitter,
};
