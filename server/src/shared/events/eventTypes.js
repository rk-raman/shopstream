const USER_EVENTS = {
  USER_REGISTERED: "user.registered",
  USER_UPDATED: "user.updated",
  USER_LOGGED_IN: "user.logged_in",
  USER_LOGGED_OUT: "user.logged_out",
  PASSWORD_CHANGED: "user.password_changed",
  EMAIL_VERIFIED: "user.email_verified",
};

const PRODUCT_EVENTS = {
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",
  PRODUCT_VIEWED: "product.viewed",
  PRODUCT_SEARCHED: "product.searched",
};

const ORDER_EVENTS = {
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_SHIPPED: "order.shipped",
  ORDER_DELIVERED: "order.delivered",
  ORDER_RETURNED: "order.returned",
};

const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_COMPLETED: "payment.completed",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_REFUNDED: "payment.refunded",
};

const INVENTORY_EVENTS = {
  INVENTORY_UPDATED: "inventory.updated",
  LOW_STOCK_ALERT: "inventory.low_stock",
  OUT_OF_STOCK: "inventory.out_of_stock",
  STOCK_REPLENISHED: "inventory.replenished",
};

const CART_EVENTS = {
  ITEM_ADDED_TO_CART: "cart.item_added",
  ITEM_REMOVED_FROM_CART: "cart.item_removed",
  CART_CLEARED: "cart.cleared",
  CART_ABANDONED: "cart.abandoned",
};

const REVIEW_EVENTS = {
  REVIEW_CREATED: "review.created",
  REVIEW_UPDATED: "review.updated",
  REVIEW_DELETED: "review.deleted",
};

const NOTIFICATION_EVENTS = {
  EMAIL_SENT: "notification.email_sent",
  SMS_SENT: "notification.sms_sent",
  PUSH_NOTIFICATION_SENT: "notification.push_sent",
};

module.exports = {
  USER_EVENTS,
  PRODUCT_EVENTS,
  ORDER_EVENTS,
  PAYMENT_EVENTS,
  INVENTORY_EVENTS,
  CART_EVENTS,
  REVIEW_EVENTS,
  NOTIFICATION_EVENTS,
};
