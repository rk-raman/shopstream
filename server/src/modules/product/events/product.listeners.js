/**
 * Modular Product Event Listeners
 *
 * Initializes all product event subscribers using the modular architecture
 */

const ProductSubscriberManager = require("./subscribers/ProductSubscriberManager");

// Initialize subscriber manager
const productSubscriberManager = new ProductSubscriberManager();

// Initialize all subscribers
const initializeProductEventListeners = async () => {
  try {
    await productSubscriberManager.initialize();
    console.log("Modular product event listeners initialized successfully");
  } catch (error) {
    console.error("Failed to initialize modular product event listeners:", error);
    throw error;
  }
};

// Cleanup function for graceful shutdown
const cleanupProductEventListeners = async () => {
  try {
    await productSubscriberManager.cleanup();
    console.log("Modular product event listeners cleaned up successfully");
  } catch (error) {
    console.error("Failed to cleanup modular product event listeners:", error);
    throw error;
  }
};

// Health check function
const getProductEventListenersHealth = async () => {
  return await productSubscriberManager.healthCheck();
};

module.exports = {
  initializeProductEventListeners,
  cleanupProductEventListeners,
  getProductEventListenersHealth,
  productSubscriberManager,
};
