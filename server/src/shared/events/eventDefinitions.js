/**
 * Centralized Event Definitions
 *
 * This file contains all event definitions with their schemas,
 * making it easy to maintain and validate events across the system
 */

/**
 * Event Categories
 */
const EVENT_CATEGORIES = {
  USER: "user",
  PRODUCT: "product",
  ORDER: "order",
  PAYMENT: "payment",
  INVENTORY: "inventory",
  CART: "cart",
  REVIEW: "review",
  NOTIFICATION: "notification",
  ANALYTICS: "analytics",
};

/**
 * User Events with detailed schemas
 */
const USER_EVENTS = {
  // Authentication Events
  USER_REGISTERED: {
    name: "user.registered",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      email: "string",
      firstName: "string",
      lastName: "string",
      role: "string",
      registrationMethod: "string",
      timestamp: "string",
      metadata: {
        userAgent: "string",
        ipAddress: "string",
        referrer: "string",
      },
    },
  },

  USER_LOGGED_IN: {
    name: "user.logged_in",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      email: "string",
      loginMethod: "string",
      timestamp: "string",
      metadata: {
        userAgent: "string",
        ipAddress: "string",
        sessionId: "string",
      },
    },
  },

  USER_LOGGED_OUT: {
    name: "user.logged_out",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      sessionId: "string",
      timestamp: "string",
      metadata: {
        logoutReason: "string",
        sessionDuration: "number",
      },
    },
  },

  USER_LOGIN_FAILED: {
    name: "user.login_failed",
    category: EVENT_CATEGORIES.USER,
    schema: {
      email: "string",
      attemptCount: "number",
      timestamp: "string",
      metadata: {
        userAgent: "string",
        ipAddress: "string",
        failureReason: "string",
      },
    },
  },

  USER_ACCOUNT_LOCKED: {
    name: "user.account_locked",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      email: "string",
      reason: "string",
      lockedUntil: "string",
      timestamp: "string",
    },
  },

  // Profile Events
  USER_UPDATED: {
    name: "user.updated",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      changes: "object",
      timestamp: "string",
      updatedBy: "string",
    },
  },

  USER_PROFILE_COMPLETED: {
    name: "user.profile_completed",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      completionPercentage: "number",
      completedFields: "array",
      timestamp: "string",
    },
  },

  USER_AVATAR_UPDATED: {
    name: "user.avatar_updated",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      avatarUrl: "string",
      timestamp: "string",
    },
  },

  // Security Events
  PASSWORD_CHANGED: {
    name: "user.password_changed",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      changeMethod: "string",
      timestamp: "string",
      metadata: {
        ipAddress: "string",
        userAgent: "string",
      },
    },
  },

  EMAIL_VERIFIED: {
    name: "user.email_verified",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      email: "string",
      verificationMethod: "string",
      timestamp: "string",
    },
  },

  PHONE_VERIFIED: {
    name: "user.phone_verified",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      phone: "string",
      verificationMethod: "string",
      timestamp: "string",
    },
  },

  // Address Events
  ADDRESS_ADDED: {
    name: "user.address_added",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      addressId: "string",
      addressType: "string",
      city: "string",
      state: "string",
      pincode: "string",
      timestamp: "string",
    },
  },

  ADDRESS_UPDATED: {
    name: "user.address_updated",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      addressId: "string",
      changes: "object",
      timestamp: "string",
    },
  },

  ADDRESS_DELETED: {
    name: "user.address_deleted",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      addressId: "string",
      timestamp: "string",
    },
  },

  // Wishlist Events
  WISHLIST_ITEM_ADDED: {
    name: "user.wishlist_item_added",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      productId: "string",
      productCategory: "string",
      productPrice: "number",
      timestamp: "string",
    },
  },

  WISHLIST_ITEM_REMOVED: {
    name: "user.wishlist_item_removed",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      productId: "string",
      timestamp: "string",
    },
  },

  // Account Status Events
  USER_ACTIVATED: {
    name: "user.activated",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      activatedBy: "string",
      reason: "string",
      timestamp: "string",
    },
  },

  USER_DEACTIVATED: {
    name: "user.deactivated",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      deactivatedBy: "string",
      reason: "string",
      timestamp: "string",
    },
  },

  USER_DELETED: {
    name: "user.deleted",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      deletedBy: "string",
      reason: "string",
      timestamp: "string",
    },
  },

  USER_ROLE_CHANGED: {
    name: "user.role_changed",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      oldRole: "string",
      newRole: "string",
      changedBy: "string",
      reason: "string",
      timestamp: "string",
    },
  },

  // Activity Events
  USER_ACTIVITY_TRACKED: {
    name: "user.activity_tracked",
    category: EVENT_CATEGORIES.USER,
    schema: {
      userId: "string",
      activityType: "string",
      timestamp: "string",
      metadata: "object",
    },
  },
};

/**
 * Product Events
 */
const PRODUCT_EVENTS = {
  PRODUCT_CREATED: {
    name: "product.created",
    category: EVENT_CATEGORIES.PRODUCT,
    schema: {
      productId: "string",
      name: "string",
      category: "string",
      price: "number",
      createdBy: "string",
      timestamp: "string",
    },
  },

  PRODUCT_UPDATED: {
    name: "product.updated",
    category: EVENT_CATEGORIES.PRODUCT,
    schema: {
      productId: "string",
      changes: "object",
      updatedBy: "string",
      timestamp: "string",
    },
  },

  PRODUCT_DELETED: {
    name: "product.deleted",
    category: EVENT_CATEGORIES.PRODUCT,
    schema: {
      productId: "string",
      deletedBy: "string",
      reason: "string",
      timestamp: "string",
    },
  },

  PRODUCT_LOW_STOCK: {
    name: "product.low_stock",
    category: EVENT_CATEGORIES.PRODUCT,
    schema: {
      productId: "string",
      productName: "string",
      currentStock: "number",
      threshold: "number",
      timestamp: "string",
    },
  },

  PRODUCT_OUT_OF_STOCK: {
    name: "product.out_of_stock",
    category: EVENT_CATEGORIES.PRODUCT,
    schema: {
      productId: "string",
      productName: "string",
      timestamp: "string",
    },
  },

  PRODUCT_BACK_IN_STOCK: {
    name: "product.back_in_stock",
    category: EVENT_CATEGORIES.PRODUCT,
    schema: {
      productId: "string",
      productName: "string",
      newStock: "number",
      timestamp: "string",
    },
  },
};

/**
 * Order Events
 */
const ORDER_EVENTS = {
  ORDER_CREATED: {
    name: "order.created",
    category: EVENT_CATEGORIES.ORDER,
    schema: {
      orderId: "string",
      userId: "string",
      totalAmount: "number",
      items: "array",
      timestamp: "string",
    },
  },

  ORDER_CONFIRMED: {
    name: "order.confirmed",
    category: EVENT_CATEGORIES.ORDER,
    schema: {
      orderId: "string",
      userId: "string",
      estimatedDelivery: "string",
      timestamp: "string",
    },
  },

  ORDER_SHIPPED: {
    name: "order.shipped",
    category: EVENT_CATEGORIES.ORDER,
    schema: {
      orderId: "string",
      userId: "string",
      trackingNumber: "string",
      carrier: "string",
      timestamp: "string",
    },
  },

  ORDER_DELIVERED: {
    name: "order.delivered",
    category: EVENT_CATEGORIES.ORDER,
    schema: {
      orderId: "string",
      userId: "string",
      deliveredAt: "string",
      timestamp: "string",
    },
  },

  ORDER_UPDATED: {
    name: "order.updated",
    category: EVENT_CATEGORIES.ORDER,
    schema: {
      orderId: "string",
      changes: "object",
      updatedBy: "string",
      timestamp: "string",
    },
  },

  ORDER_COMPLETED: {
    name: "order.completed",
    category: EVENT_CATEGORIES.ORDER,
    schema: {
      orderId: "string",
      userId: "string",
      totalAmount: "number",
      categories: "array",
      timestamp: "string",
    },
  },
};

/**
 * Payment Events
 */
const PAYMENT_EVENTS = {
  PAYMENT_INITIATED: {
    name: "payment.initiated",
    category: EVENT_CATEGORIES.PAYMENT,
    schema: {
      paymentId: "string",
      userId: "string",
      orderId: "string",
      amount: "number",
      paymentMethod: "string",
      timestamp: "string",
    },
  },

  PAYMENT_SUCCESSFUL: {
    name: "payment.successful",
    category: EVENT_CATEGORIES.PAYMENT,
    schema: {
      paymentId: "string",
      userId: "string",
      orderId: "string",
      amount: "number",
      paymentMethod: "string",
      transactionId: "string",
      timestamp: "string",
    },
  },

  PAYMENT_FAILED: {
    name: "payment.failed",
    category: EVENT_CATEGORIES.PAYMENT,
    schema: {
      paymentId: "string",
      userId: "string",
      orderId: "string",
      amount: "number",
      paymentMethod: "string",
      reason: "string",
      timestamp: "string",
    },
  },

  PAYMENT_REFUNDED: {
    name: "payment.refunded",
    category: EVENT_CATEGORIES.PAYMENT,
    schema: {
      paymentId: "string",
      userId: "string",
      orderId: "string",
      refundAmount: "number",
      reason: "string",
      refundedBy: "string",
      timestamp: "string",
    },
  },
};

/**
 * Event Registry - All events in one place
 */
const EVENT_REGISTRY = {
  ...USER_EVENTS,
  ...PRODUCT_EVENTS,
  ...ORDER_EVENTS,
  ...PAYMENT_EVENTS,
};

/**
 * Get event definition by name
 */
const getEventDefinition = (eventName) => {
  return Object.values(EVENT_REGISTRY).find(
    (event) => event.name === eventName
  );
};

/**
 * Get all events by category
 */
const getEventsByCategory = (category) => {
  return Object.values(EVENT_REGISTRY).filter(
    (event) => event.category === category
  );
};

/**
 * Validate event payload against schema
 */
const validateEventPayload = (eventName, payload) => {
  const eventDef = getEventDefinition(eventName);
  if (!eventDef) {
    throw new Error(`Unknown event: ${eventName}`);
  }

  // Basic validation - in production, use a proper schema validation library like Joi or Yup
  const schema = eventDef.schema;
  const errors = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!(key in payload)) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }

    const actualType = typeof payload[key];
    if (actualType !== expectedType) {
      errors.push(`Field ${key} expected ${expectedType}, got ${actualType}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Event validation failed for ${eventName}: ${errors.join(", ")}`
    );
  }

  return true;
};

module.exports = {
  EVENT_CATEGORIES,
  USER_EVENTS,
  PRODUCT_EVENTS,
  ORDER_EVENTS,
  PAYMENT_EVENTS,
  EVENT_REGISTRY,
  getEventDefinition,
  getEventsByCategory,
  validateEventPayload,
};
