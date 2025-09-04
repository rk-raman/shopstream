// Enhanced user.events.js
const eventEmitter = require("../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../shared/events/eventTypes");

// Authentication Events
const publishUserRegistered = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_REGISTERED, {
    userId: userData.userId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    registrationMethod: userData.registrationMethod || "email",
    timestamp: new Date().toISOString(),
    metadata: {
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
      referrer: userData.referrer,
    },
  });
};

const publishUserLoggedIn = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_LOGGED_IN, {
    userId: userData.userId,
    email: userData.email,
    loginMethod: userData.loginMethod || "email",
    timestamp: new Date().toISOString(),
    metadata: {
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
      deviceType: userData.deviceType,
      location: userData.location,
    },
  });
};

const publishUserLoggedOut = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_LOGGED_OUT, {
    userId: userData.userId,
    sessionDuration: userData.sessionDuration,
    timestamp: new Date().toISOString(),
  });
};

const publishUserLoginFailed = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_LOGIN_FAILED, {
    email: userData.email,
    reason: userData.reason,
    attemptCount: userData.attemptCount,
    timestamp: new Date().toISOString(),
    metadata: {
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
    },
  });
};

const publishUserAccountLocked = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_ACCOUNT_LOCKED, {
    userId: userData.userId,
    email: userData.email,
    reason: userData.reason,
    lockedUntil: userData.lockedUntil,
    timestamp: new Date().toISOString(),
  });
};

// Profile Events
const publishUserUpdated = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_UPDATED, {
    userId: userData.userId,
    changes: userData.changes,
    previousValues: userData.previousValues,
    updatedBy: userData.updatedBy, // userId or 'system' or 'admin'
    timestamp: new Date().toISOString(),
  });
};

const publishUserProfileCompleted = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_PROFILE_COMPLETED, {
    userId: userData.userId,
    completionPercentage: userData.completionPercentage,
    completedFields: userData.completedFields,
    timestamp: new Date().toISOString(),
  });
};

const publishUserAvatarUpdated = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_AVATAR_UPDATED, {
    userId: userData.userId,
    oldAvatarUrl: userData.oldAvatarUrl,
    newAvatarUrl: userData.newAvatarUrl,
    timestamp: new Date().toISOString(),
  });
};

const publishUserPreferencesUpdated = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_PREFERENCES_UPDATED, {
    userId: userData.userId,
    preferences: userData.preferences,
    changedPreferences: userData.changedPreferences,
    timestamp: new Date().toISOString(),
  });
};

// Security Events
const publishPasswordChanged = (userData) => {
  eventEmitter.publish(USER_EVENTS.PASSWORD_CHANGED, {
    userId: userData.userId,
    changeMethod: userData.changeMethod, // 'user_initiated' or 'reset'
    timestamp: new Date().toISOString(),
    metadata: {
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
    },
  });
};

const publishPasswordResetRequested = (userData) => {
  eventEmitter.publish(USER_EVENTS.PASSWORD_RESET_REQUESTED, {
    userId: userData.userId,
    email: userData.email,
    resetMethod: userData.resetMethod, // 'email' or 'sms'
    timestamp: new Date().toISOString(),
  });
};

const publishEmailVerified = (userData) => {
  eventEmitter.publish(USER_EVENTS.EMAIL_VERIFIED, {
    userId: userData.userId,
    email: userData.email,
    verificationMethod: userData.verificationMethod,
    timestamp: new Date().toISOString(),
  });
};

const publishPhoneVerified = (userData) => {
  eventEmitter.publish(USER_EVENTS.PHONE_VERIFIED, {
    userId: userData.userId,
    phone: userData.phone,
    verificationMethod: userData.verificationMethod,
    timestamp: new Date().toISOString(),
  });
};

const publishTwoFactorEnabled = (userData) => {
  eventEmitter.publish(USER_EVENTS.TWO_FACTOR_ENABLED, {
    userId: userData.userId,
    method: userData.method, // 'app' or 'sms'
    timestamp: new Date().toISOString(),
  });
};

// Address Events
const publishAddressAdded = (userData) => {
  eventEmitter.publish(USER_EVENTS.ADDRESS_ADDED, {
    userId: userData.userId,
    addressId: userData.addressId,
    addressType: userData.addressType,
    isDefault: userData.isDefault,
    city: userData.city,
    state: userData.state,
    pincode: userData.pincode,
    timestamp: new Date().toISOString(),
  });
};

const publishAddressUpdated = (userData) => {
  eventEmitter.publish(USER_EVENTS.ADDRESS_UPDATED, {
    userId: userData.userId,
    addressId: userData.addressId,
    changes: userData.changes,
    previousValues: userData.previousValues,
    timestamp: new Date().toISOString(),
  });
};

const publishAddressDeleted = (userData) => {
  eventEmitter.publish(USER_EVENTS.ADDRESS_DELETED, {
    userId: userData.userId,
    addressId: userData.addressId,
    addressType: userData.addressType,
    wasDefault: userData.wasDefault,
    timestamp: new Date().toISOString(),
  });
};

const publishDefaultAddressChanged = (userData) => {
  eventEmitter.publish(USER_EVENTS.DEFAULT_ADDRESS_CHANGED, {
    userId: userData.userId,
    newDefaultAddressId: userData.newDefaultAddressId,
    oldDefaultAddressId: userData.oldDefaultAddressId,
    timestamp: new Date().toISOString(),
  });
};

// Wishlist Events
const publishWishlistItemAdded = (userData) => {
  eventEmitter.publish(USER_EVENTS.WISHLIST_ITEM_ADDED, {
    userId: userData.userId,
    productId: userData.productId,
    productName: userData.productName,
    productCategory: userData.productCategory,
    productPrice: userData.productPrice,
    timestamp: new Date().toISOString(),
  });
};

const publishWishlistItemRemoved = (userData) => {
  eventEmitter.publish(USER_EVENTS.WISHLIST_ITEM_REMOVED, {
    userId: userData.userId,
    productId: userData.productId,
    removeReason: userData.removeReason, // 'user_action', 'product_unavailable', etc.
    timestamp: new Date().toISOString(),
  });
};

const publishWishlistCleared = (userData) => {
  eventEmitter.publish(USER_EVENTS.WISHLIST_CLEARED, {
    userId: userData.userId,
    itemCount: userData.itemCount,
    clearReason: userData.clearReason, // 'user_action', 'bulk_purchase', etc.
    timestamp: new Date().toISOString(),
  });
};

// Account Status Events
const publishUserDeactivated = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_DEACTIVATED, {
    userId: userData.userId,
    deactivatedBy: userData.deactivatedBy, // userId or 'system' or 'admin'
    reason: userData.reason,
    timestamp: new Date().toISOString(),
  });
};

const publishUserActivated = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_ACTIVATED, {
    userId: userData.userId,
    activatedBy: userData.activatedBy,
    reason: userData.reason,
    timestamp: new Date().toISOString(),
  });
};

const publishUserRoleChanged = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_ROLE_CHANGED, {
    userId: userData.userId,
    oldRole: userData.oldRole,
    newRole: userData.newRole,
    changedBy: userData.changedBy,
    reason: userData.reason,
    timestamp: new Date().toISOString(),
  });
};

// Activity Events
const publishUserActivityTracked = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_ACTIVITY_TRACKED, {
    userId: userData.userId,
    activityType: userData.activityType,
    activityDetails: userData.activityDetails,
    timestamp: new Date().toISOString(),
    metadata: {
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress,
      page: userData.page,
      sessionId: userData.sessionId,
    },
  });
};

const publishUserSessionStarted = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_SESSION_STARTED, {
    userId: userData.userId,
    sessionId: userData.sessionId,
    deviceInfo: userData.deviceInfo,
    timestamp: new Date().toISOString(),
  });
};

const publishUserSessionEnded = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_SESSION_ENDED, {
    userId: userData.userId,
    sessionId: userData.sessionId,
    sessionDuration: userData.sessionDuration,
    endReason: userData.endReason, // 'logout', 'timeout', 'forced'
    timestamp: new Date().toISOString(),
  });
};

// Social Events
const publishUserSocialLogin = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_SOCIAL_LOGIN, {
    userId: userData.userId,
    provider: userData.provider, // 'google', 'facebook', 'apple'
    providerId: userData.providerId,
    isNewUser: userData.isNewUser,
    timestamp: new Date().toISOString(),
  });
};

const publishSocialAccountLinked = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_SOCIAL_ACCOUNT_LINKED, {
    userId: userData.userId,
    provider: userData.provider,
    providerId: userData.providerId,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  // Authentication Events
  publishUserRegistered,
  publishUserLoggedIn,
  publishUserLoggedOut,
  publishUserLoginFailed,
  publishUserAccountLocked,

  // Profile Events
  publishUserUpdated,
  publishUserProfileCompleted,
  publishUserAvatarUpdated,
  publishUserPreferencesUpdated,

  // Security Events
  publishPasswordChanged,
  publishPasswordResetRequested,
  publishEmailVerified,
  publishPhoneVerified,
  publishTwoFactorEnabled,

  // Address Events
  publishAddressAdded,
  publishAddressUpdated,
  publishAddressDeleted,
  publishDefaultAddressChanged,

  // Wishlist Events
  publishWishlistItemAdded,
  publishWishlistItemRemoved,
  publishWishlistCleared,

  // Account Status Events
  publishUserDeactivated,
  publishUserActivated,
  publishUserRoleChanged,

  // Activity Events
  publishUserActivityTracked,
  publishUserSessionStarted,
  publishUserSessionEnded,

  // Social Events
  publishUserSocialLogin,
  publishSocialAccountLinked,
};
