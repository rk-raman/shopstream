// Re-export product event artifacts for convenience
const ProductEventPublisher = require("./publishers/ProductEventPublisher");
const ProductSubscriberManager = require("./subscribers/ProductSubscriberManager");
const {
  initializeProductEventListeners,
  cleanupProductEventListeners,
  getProductEventListenersHealth,
} = require("./product.listeners");

module.exports = {
  ProductEventPublisher,
  ProductSubscriberManager,
  initializeProductEventListeners,
  cleanupProductEventListeners,
  getProductEventListenersHealth,
};
