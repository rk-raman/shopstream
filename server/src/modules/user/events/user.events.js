const eventEmitter = require("../../../shared/events/eventEmitter");
const { USER_EVENTS } = require("../../../shared/events/eventTypes");

// User registration event
const publishUserRegistered = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_REGISTERED, {
    userId: userData.userId,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    timestamp: new Date().toISOString(),
  });
};

// User login event
const publishUserLoggedIn = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_LOGGED_IN, {
    userId: userData.userId,
    email: userData.email,
    timestamp: new Date().toISOString(),
  });
};

// User profile updated event
const publishUserUpdated = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_UPDATED, {
    userId: userData.userId,
    changes: userData.changes,
    timestamp: new Date().toISOString(),
  });
};

// User deactivated event
const publishUserDeactivated = (userData) => {
  eventEmitter.publish(USER_EVENTS.USER_DEACTIVATED, {
    userId: userData.userId,
    timestamp: new Date().toISOString(),
  });
};

// Email verification event
const publishEmailVerified = (userData) => {
  eventEmitter.publish(USER_EVENTS.EMAIL_VERIFIED, {
    userId: userData.userId,
    email: userData.email,
    timestamp: new Date().toISOString(),
  });
};

// Password changed event
const publishPasswordChanged = (userData) => {
  eventEmitter.publish(USER_EVENTS.PASSWORD_CHANGED, {
    userId: userData.userId,
    timestamp: new Date().toISOString(),
  });
};

// Address added event
const publishAddressAdded = (userData) => {
  eventEmitter.publish(USER_EVENTS.ADDRESS_ADDED, {
    userId: userData.userId,
    addressId: userData.addressId,
    addressType: userData.addressType,
    timestamp: new Date().toISOString(),
  });
};

// Address updated event
const publishAddressUpdated = (userData) => {
  eventEmitter.publish(USER_EVENTS.ADDRESS_UPDATED, {
    userId: userData.userId,
    addressId: userData.addressId,
    changes: userData.changes,
    timestamp: new Date().toISOString(),
  });
};

// Address deleted event
const publishAddressDeleted = (userData) => {
  eventEmitter.publish(USER_EVENTS.ADDRESS_DELETED, {
    userId: userData.userId,
    addressId: userData.addressId,
    timestamp: new Date().toISOString(),
  });
};

// Wishlist updated event
const publishWishlistUpdated = (userData) => {
  eventEmitter.publish(USER_EVENTS.WISHLIST_UPDATED, {
    userId: userData.userId,
    action: userData.action, // 'added', 'removed', 'cleared'
    productId: userData.productId,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  publishUserRegistered,
  publishUserLoggedIn,
  publishUserUpdated,
  publishUserDeactivated,
  publishEmailVerified,
  publishPasswordChanged,
  publishAddressAdded,
  publishAddressUpdated,
  publishAddressDeleted,
  publishWishlistUpdated,
};
