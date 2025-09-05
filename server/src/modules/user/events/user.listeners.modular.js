/**
 * Modular User Event Listeners
 *
 * This file initializes all user event subscribers using the new modular architecture
 * It replaces the old monolithic user.listeners.js file
 */

const UserSubscriberManager = require("./subscribers/UserSubscriberManager");

// Initialize subscriber manager
const userSubscriberManager = new UserSubscriberManager();

// Initialize all subscribers
const initializeUserEventListeners = async () => {
  try {
    await userSubscriberManager.initialize();
    console.log("Modular user event listeners initialized successfully");
  } catch (error) {
    console.error("Failed to initialize modular user event listeners:", error);
    throw error;
  }
};

// Cleanup function for graceful shutdown
const cleanupUserEventListeners = async () => {
  try {
    await userSubscriberManager.cleanup();
    console.log("Modular user event listeners cleaned up successfully");
  } catch (error) {
    console.error("Failed to cleanup modular user event listeners:", error);
    throw error;
  }
};

// Health check function
const getUserEventListenersHealth = async () => {
  return await userSubscriberManager.healthCheck();
};

// Auto-initialize when this module is loaded
initializeUserEventListeners().catch(console.error);

module.exports = {
  initializeUserEventListeners,
  cleanupUserEventListeners,
  getUserEventListenersHealth,
  userSubscriberManager,
};
