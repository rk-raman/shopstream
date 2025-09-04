const eventEmitter = require("../../../shared/events/eventEmitter");
const {
  USER_EVENTS,
  ORDER_EVENTS,
} = require("../../../shared/events/eventTypes");
const userEvents = require("./user.events");

// Authentication Listeners
eventEmitter.subscribe(USER_EVENTS.USER_REGISTERED, async (data) => {
  console.log("User registered event received:", data);

  // Send welcome email
  eventEmitter.publish("notification.send_email", {
    type: "welcome",
    to: data.email,
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });

  // Initialize user analytics
  eventEmitter.publish("analytics.user_registered", {
    userId: data.userId,
    timestamp: data.timestamp,
    metadata: data.metadata,
  });

  // Create default user segments
  eventEmitter.publish("marketing.user_segment_assigned", {
    userId: data.userId,
    segments: ["new_user", `role_${data.role}`],
    timestamp: data.timestamp,
  });
});

eventEmitter.subscribe(USER_EVENTS.USER_LOGGED_IN, async (data) => {
  console.log("User logged in event received:", data);

  // Track login analytics
  eventEmitter.publish("analytics.user_login", {
    userId: data.userId,
    timestamp: data.timestamp,
    metadata: data.metadata,
  });

  // Update user session
  eventEmitter.publish("session.user_session_started", {
    userId: data.userId,
    sessionData: data.metadata,
    timestamp: data.timestamp,
  });

  // Check for suspicious login activity
  eventEmitter.publish("security.login_activity_check", {
    userId: data.userId,
    loginData: data,
    timestamp: data.timestamp,
  });
});

eventEmitter.subscribe(USER_EVENTS.USER_LOGIN_FAILED, async (data) => {
  console.log("Failed login attempt:", data);

  // Track failed login for security
  eventEmitter.publish("security.failed_login_attempt", {
    email: data.email,
    attemptCount: data.attemptCount,
    metadata: data.metadata,
    timestamp: data.timestamp,
  });

  // Send security alert if multiple failures
  if (data.attemptCount >= 3) {
    eventEmitter.publish("notification.send_email", {
      type: "security_alert",
      to: data.email,
      data: {
        attemptCount: data.attemptCount,
        timestamp: data.timestamp,
        ipAddress: data.metadata?.ipAddress,
      },
    });
  }
});

eventEmitter.subscribe(USER_EVENTS.USER_ACCOUNT_LOCKED, async (data) => {
  console.log("User account locked:", data);

  // Send account locked notification
  eventEmitter.publish("notification.send_email", {
    type: "account_locked",
    to: data.email,
    data: {
      reason: data.reason,
      lockedUntil: data.lockedUntil,
      timestamp: data.timestamp,
    },
  });

  // Log security event
  eventEmitter.publish("security.account_locked", data);
});

// Profile Listeners
eventEmitter.subscribe(USER_EVENTS.USER_UPDATED, async (data) => {
  console.log("User profile updated:", data);

  // Track profile completion
  eventEmitter.publish("analytics.profile_updated", {
    userId: data.userId,
    changes: data.changes,
    timestamp: data.timestamp,
  });

  // Check if profile is now complete
  if (data.changes.phone || data.changes.dateOfBirth) {
    eventEmitter.publish("user.check_profile_completion", {
      userId: data.userId,
      timestamp: data.timestamp,
    });
  }
});

eventEmitter.subscribe(USER_EVENTS.USER_PROFILE_COMPLETED, async (data) => {
  console.log("User profile completed:", data);

  // Send congratulations email
  eventEmitter.publish("notification.send_email", {
    type: "profile_completed",
    userId: data.userId,
    data: {
      completionPercentage: data.completionPercentage,
      completedFields: data.completedFields,
    },
  });

  // Assign profile completion rewards
  eventEmitter.publish("rewards.profile_completion_bonus", {
    userId: data.userId,
    timestamp: data.timestamp,
  });
});

// Security Listeners
eventEmitter.subscribe(USER_EVENTS.PASSWORD_CHANGED, async (data) => {
  console.log("Password changed:", data);

  // Send password changed confirmation
  eventEmitter.publish("notification.send_email", {
    type: "password_changed_confirmation",
    userId: data.userId,
    data: {
      changeMethod: data.changeMethod,
      timestamp: data.timestamp,
    },
  });

  // Log security event
  eventEmitter.publish("security.password_changed", data);
});

eventEmitter.subscribe(USER_EVENTS.EMAIL_VERIFIED, async (data) => {
  console.log("Email verified:", data);

  // Send welcome email after verification
  eventEmitter.publish("notification.send_email", {
    type: "email_verified_welcome",
    to: data.email,
    data: {
      verificationMethod: data.verificationMethod,
      timestamp: data.timestamp,
    },
  });

  // Update user segments
  eventEmitter.publish("marketing.user_segment_assigned", {
    userId: data.userId,
    segments: ["verified_email"],
    timestamp: data.timestamp,
  });
});

eventEmitter.subscribe(USER_EVENTS.PHONE_VERIFIED, async (data) => {
  console.log("Phone verified:", data);

  // Send SMS confirmation
  eventEmitter.publish("notification.send_sms", {
    type: "phone_verified",
    to: data.phone,
    data: {
      verificationMethod: data.verificationMethod,
      timestamp: data.timestamp,
    },
  });

  // Update user segments
  eventEmitter.publish("marketing.user_segment_assigned", {
    userId: data.userId,
    segments: ["verified_phone"],
    timestamp: data.timestamp,
  });
});

// Address Listeners
eventEmitter.subscribe(USER_EVENTS.ADDRESS_ADDED, async (data) => {
  console.log("Address added:", data);

  // Track address analytics
  eventEmitter.publish("analytics.address_added", {
    userId: data.userId,
    addressType: data.addressType,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    timestamp: data.timestamp,
  });

  // Update delivery zones
  eventEmitter.publish("logistics.update_delivery_zones", {
    pincode: data.pincode,
    city: data.city,
    state: data.state,
    timestamp: data.timestamp,
  });
});

eventEmitter.subscribe(USER_EVENTS.ADDRESS_UPDATED, async (data) => {
  console.log("Address updated:", data);

  // Check if delivery options changed
  if (data.changes.pincode || data.changes.city) {
    eventEmitter.publish("logistics.address_location_changed", {
      userId: data.userId,
      addressId: data.addressId,
      changes: data.changes,
      timestamp: data.timestamp,
    });
  }
});

// Wishlist Listeners
eventEmitter.subscribe(USER_EVENTS.WISHLIST_ITEM_ADDED, async (data) => {
  console.log("Item added to wishlist:", data);

  // Track wishlist analytics
  eventEmitter.publish("analytics.wishlist_item_added", {
    userId: data.userId,
    productId: data.productId,
    productCategory: data.productCategory,
    productPrice: data.productPrice,
    timestamp: data.timestamp,
  });

  // Send price drop alert setup
  eventEmitter.publish("pricing.setup_price_alert", {
    userId: data.userId,
    productId: data.productId,
    currentPrice: data.productPrice,
    timestamp: data.timestamp,
  });

  // Update recommendation engine
  eventEmitter.publish("recommendations.wishlist_updated", {
    userId: data.userId,
    productId: data.productId,
    action: "added",
    timestamp: data.timestamp,
  });
});

eventEmitter.subscribe(USER_EVENTS.WISHLIST_ITEM_REMOVED, async (data) => {
  console.log("Item removed from wishlist:", data);

  // Cancel price alerts
  eventEmitter.publish("pricing.cancel_price_alert", {
    userId: data.userId,
    productId: data.productId,
    timestamp: data.timestamp,
  });

  // Update recommendation engine
  eventEmitter.publish("recommendations.wishlist_updated", {
    userId: data.userId,
    productId: data.productId,
    action: "removed",
    timestamp: data.timestamp,
  });
});

// Account Status Listeners
eventEmitter.subscribe(USER_EVENTS.USER_DEACTIVATED, async (data) => {
  console.log("User deactivated:", data);

  // Send account deactivation confirmation
  eventEmitter.publish("notification.send_email", {
    type: "account_deactivated",
    userId: data.userId,
    data: {
      deactivatedBy: data.deactivatedBy,
      reason: data.reason,
      timestamp: data.timestamp,
    },
  });

  // Clear user sessions
  eventEmitter.publish("session.clear_user_sessions", {
    userId: data.userId,
    timestamp: data.timestamp,
  });

  // Update analytics
  eventEmitter.publish("analytics.user_deactivated", data);
});

eventEmitter.subscribe(USER_EVENTS.USER_ROLE_CHANGED, async (data) => {
  console.log("User role changed:", data);

  // Send role change notification
  eventEmitter.publish("notification.send_email", {
    type: "role_changed",
    userId: data.userId,
    data: {
      oldRole: data.oldRole,
      newRole: data.newRole,
      changedBy: data.changedBy,
      reason: data.reason,
      timestamp: data.timestamp,
    },
  });

  // Update user permissions
  eventEmitter.publish("auth.update_user_permissions", {
    userId: data.userId,
    newRole: data.newRole,
    timestamp: data.timestamp,
  });

  // Update marketing segments
  eventEmitter.publish("marketing.user_segment_assigned", {
    userId: data.userId,
    segments: [`role_${data.newRole}`],
    removeSegments: [`role_${data.oldRole}`],
    timestamp: data.timestamp,
  });
});

// Activity Listeners
eventEmitter.subscribe(USER_EVENTS.USER_ACTIVITY_TRACKED, async (data) => {
  // Update user's last active timestamp
  eventEmitter.publish("analytics.activity_tracked", {
    userId: data.userId,
    activityType: data.activityType,
    timestamp: data.timestamp,
    metadata: data.metadata,
  });

  // Check for inactive users
  eventEmitter.publish("marketing.check_user_engagement", {
    userId: data.userId,
    activityType: data.activityType,
    timestamp: data.timestamp,
  });
});

// Cross-module event listeners
eventEmitter.subscribe(ORDER_EVENTS.ORDER_COMPLETED, async (data) => {
  console.log("Order completed - updating user analytics:", data);

  // Update user purchase history analytics
  eventEmitter.publish("analytics.user_purchase_completed", {
    userId: data.userId,
    orderId: data.orderId,
    orderValue: data.totalAmount,
    items: data.items,
    timestamp: data.timestamp,
  });

  // Update user segments based on purchase behavior
  eventEmitter.publish("marketing.user_purchase_segment_update", {
    userId: data.userId,
    orderValue: data.totalAmount,
    categoryPurchases: data.categories,
    timestamp: data.timestamp,
  });

  // Send order completion thank you
  eventEmitter.publish("notification.send_email", {
    type: "order_completed_thanks",
    userId: data.userId,
    data: {
      orderId: data.orderId,
      orderValue: data.totalAmount,
      timestamp: data.timestamp,
    },
  });
});

// Product interaction listeners
eventEmitter.subscribe("product.viewed", async (data) => {
  console.log("Product viewed - tracking user behavior:", data);

  // Track user product interests
  eventEmitter.publish("analytics.user_product_interaction", {
    userId: data.userId,
    productId: data.productId,
    interactionType: "viewed",
    timestamp: data.timestamp,
  });

  // Update recommendation engine
  eventEmitter.publish("recommendations.product_viewed", {
    userId: data.userId,
    productId: data.productId,
    category: data.category,
    timestamp: data.timestamp,
  });
});

console.log("Enhanced user event listeners initialized");

// Event Error Handling
eventEmitter.on("error", (error) => {
  console.error("User event error:", error);

  // Log error to monitoring system
  eventEmitter.publish("monitoring.event_error", {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
});
