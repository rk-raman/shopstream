const USER_EVENTS = {
  // Authentication Events
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
  USER_LOGGED_OUT: "user.logged_out",
  USER_LOGIN_FAILED: "user.login_failed",
  USER_ACCOUNT_LOCKED: "user.account_locked",
  USER_ACCOUNT_UNLOCKED: "user.account_unlocked",

  // Profile Events
  USER_UPDATED: "user.updated",
  USER_PROFILE_COMPLETED: "user.profile_completed",
  USER_AVATAR_UPDATED: "user.avatar_updated",
  USER_PREFERENCES_UPDATED: "user.preferences_updated",

  // Security Events
  PASSWORD_CHANGED: "user.password_changed",
  PASSWORD_RESET_REQUESTED: "user.password_reset_requested",
  PASSWORD_RESET_COMPLETED: "user.password_reset_completed",
  EMAIL_VERIFIED: "user.email_verified",
  PHONE_VERIFIED: "user.phone_verified",
  TWO_FACTOR_ENABLED: "user.two_factor_enabled",
  TWO_FACTOR_DISABLED: "user.two_factor_disabled",

  // Address Events
  ADDRESS_ADDED: "user.address_added",
  ADDRESS_UPDATED: "user.address_updated",
  ADDRESS_DELETED: "user.address_deleted",
  DEFAULT_ADDRESS_CHANGED: "user.default_address_changed",

  // Wishlist Events
  WISHLIST_UPDATED: "user.wishlist_updated",
  WISHLIST_ITEM_ADDED: "user.wishlist_item_added",
  WISHLIST_ITEM_REMOVED: "user.wishlist_item_removed",
  WISHLIST_CLEARED: "user.wishlist_cleared",

  // Account Status Events
  USER_ACTIVATED: "user.activated",
  USER_DEACTIVATED: "user.deactivated",
  USER_DELETED: "user.deleted",
  USER_ROLE_CHANGED: "user.role_changed",

  // Activity Events
  USER_ACTIVITY_TRACKED: "user.activity_tracked",
  USER_SESSION_STARTED: "user.session_started",
  USER_SESSION_ENDED: "user.session_ended",
  USER_DEVICE_CHANGED: "user.device_changed",

  // Social Events
  USER_SOCIAL_LOGIN: "user.social_login",
  USER_SOCIAL_ACCOUNT_LINKED: "user.social_account_linked",
  USER_SOCIAL_ACCOUNT_UNLINKED: "user.social_account_unlinked",
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
  // Item management events
  ITEM_ADDED_TO_CART: "cart.item_added",
  ITEM_REMOVED_FROM_CART: "cart.item_removed",
  ITEM_QUANTITY_UPDATED: "cart.item_quantity_updated",
  CART_CLEARED: "cart.cleared",

  // Cart lifecycle events
  CART_CREATED: "cart.created",
  CART_UPDATED: "cart.updated",
  CART_SYNCHRONIZED: "cart.synchronized",

  // Cart behavior events
  CART_ABANDONED: "cart.abandoned",
  CART_RECOVERED: "cart.recovered",
  CART_CHECKOUT_INITIATED: "cart.checkout_initiated",

  // Coupon events
  COUPON_APPLIED: "cart.coupon_applied",
  COUPON_REMOVED: "cart.coupon_removed",
  COUPON_EXPIRED: "cart.coupon_expired",

  // Analytics events
  CART_VALUE_CHANGED: "cart.value_changed",
  CART_ITEMS_COUNT_CHANGED: "cart.items_count_changed",
};

const CHECKOUT_EVENTS = {
  SESSION_CREATED: "checkout.session_created",
  SESSION_UPDATED: "checkout.session_updated",
  SESSION_COMPLETED: "checkout.session_completed",
  SESSION_ABANDONED: "checkout.session_abandoned",
  SESSION_EXPIRED: "checkout.session_expired",
  ADDRESS_SELECTED: "checkout.address_selected",
  COUPON_APPLIED: "checkout.coupon_applied",
  COUPON_REMOVED: "checkout.coupon_removed",
  PAYMENT_INITIATED: "checkout.payment_initiated",
  ORDER_PLACED: "checkout.order_placed",
};

const REVIEW_EVENTS = {
  REVIEW_CREATED: "review.created",
  REVIEW_UPDATED: "review.updated",
  REVIEW_DELETED: "review.deleted",
};

const NOTIFICATION_EVENTS = {
  // Notification lifecycle events
  NOTIFICATION_CREATED: "notification.created",
  NOTIFICATION_SENT: "notification.sent",
  NOTIFICATION_DELIVERED: "notification.delivered",
  NOTIFICATION_READ: "notification.read",
  NOTIFICATION_CLICKED: "notification.clicked",
  NOTIFICATION_DISMISSED: "notification.dismissed",
  NOTIFICATION_FAILED: "notification.failed",
  NOTIFICATION_EXPIRED: "notification.expired",

  // Template events
  TEMPLATE_CREATED: "notification.template.created",
  TEMPLATE_UPDATED: "notification.template.updated",
  TEMPLATE_DELETED: "notification.template.deleted",

  // Bulk operations
  BULK_NOTIFICATION_SENT: "notification.bulk.sent",

  // Analytics and system events
  NOTIFICATION_ANALYTICS: "notification.analytics",
  NOTIFICATION_SYSTEM_HEALTH: "notification.system.health",

  // Legacy events (for backward compatibility)
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
  CHECKOUT_EVENTS,
  REVIEW_EVENTS,
  NOTIFICATION_EVENTS,
};
