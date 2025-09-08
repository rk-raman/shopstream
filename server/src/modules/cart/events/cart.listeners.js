// This file has been replaced by the new subscriber system
// Individual subscribers are now in the subscribers/ directory
// Use the cartEventSubscribers from subscribers/index.js instead

const { cartEventSubscribers } = require("./subscribers");

// Export the new subscriber system for backward compatibility
module.exports = {
  cartEventSubscribers,
  // Legacy exports for backward compatibility
  cartAnalyticsSubscriber: cartEventSubscribers.getSubscriber("analytics"),
  cartNotificationSubscriber:
    cartEventSubscribers.getSubscriber("notification"),
  cartCacheSubscriber: cartEventSubscribers.getSubscriber("cache"),
};
